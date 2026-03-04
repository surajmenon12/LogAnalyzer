import asyncio

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.config import settings
from app.models import Base, Carrier, CallLog, MessageLog, SIPTrunkLog
from app.seed.generators import CARRIERS, generate_call_logs, generate_message_logs, generate_sip_trunk_logs


async def seed():
    engine = create_async_engine(settings.DATABASE_URL)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        # Carriers
        for c in CARRIERS:
            session.add(Carrier(name=c["name"], type=c["type"], region=c["region"], status="active"))
        await session.commit()
        print(f"Seeded {len(CARRIERS)} carriers")

        # Call logs
        call_data = generate_call_logs(500)
        for cd in call_data:
            session.add(CallLog(**cd))
        await session.commit()
        print(f"Seeded {len(call_data)} call logs")

        # Message logs
        msg_data = generate_message_logs(300)
        for md in msg_data:
            session.add(MessageLog(**md))
        await session.commit()
        print(f"Seeded {len(msg_data)} message logs")

        # SIP trunk logs
        sip_data = generate_sip_trunk_logs(200)
        for sd in sip_data:
            session.add(SIPTrunkLog(**sd))
        await session.commit()
        print(f"Seeded {len(sip_data)} SIP trunk logs")

    await engine.dispose()
    print("Seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed())
