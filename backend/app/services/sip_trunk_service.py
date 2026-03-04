from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional

from app.models.sip_trunk_log import SIPTrunkLog


async def get_sip_trunk_logs(
    db: AsyncSession,
    *,
    time_from: Optional[datetime] = None,
    time_to: Optional[datetime] = None,
    region: Optional[str] = None,
    carrier: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 25,
    sort_by: str = "recorded_at",
    sort_order: str = "desc",
):
    query = select(SIPTrunkLog)
    count_query = select(func.count(SIPTrunkLog.id))

    conditions = []
    if time_from:
        conditions.append(SIPTrunkLog.recorded_at >= time_from)
    if time_to:
        conditions.append(SIPTrunkLog.recorded_at <= time_to)
    if region:
        conditions.append(SIPTrunkLog.region == region)
    if carrier:
        conditions.append(SIPTrunkLog.carrier == carrier)
    if status:
        conditions.append(SIPTrunkLog.status == status)

    if conditions:
        query = query.where(and_(*conditions))
        count_query = count_query.where(and_(*conditions))

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    sort_column = getattr(SIPTrunkLog, sort_by, SIPTrunkLog.recorded_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    items = result.scalars().all()

    return items, total
