from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional

from app.models.call_log import CallLog
from app.models.message_log import MessageLog
from app.models.carrier import Carrier


async def get_overview_stats(
    db: AsyncSession,
    *,
    time_from: Optional[datetime] = None,
    time_to: Optional[datetime] = None,
):
    # Call stats
    call_conditions = []
    if time_from:
        call_conditions.append(CallLog.initiated_at >= time_from)
    if time_to:
        call_conditions.append(CallLog.initiated_at <= time_to)

    call_query = select(
        func.count(CallLog.id).label("total"),
        func.count(case((CallLog.status == "completed", 1))).label("successful"),
        func.count(case((CallLog.status == "failed", 1))).label("failed"),
        func.coalesce(func.avg(CallLog.duration), 0).label("avg_duration"),
    )
    if call_conditions:
        call_query = call_query.where(and_(*call_conditions))

    call_result = await db.execute(call_query)
    call_row = call_result.one()

    # Message stats
    msg_conditions = []
    if time_from:
        msg_conditions.append(MessageLog.sent_at >= time_from)
    if time_to:
        msg_conditions.append(MessageLog.sent_at <= time_to)

    msg_query = select(
        func.count(MessageLog.id).label("total"),
        func.count(case((MessageLog.status == "delivered", 1))).label("successful"),
        func.count(case((MessageLog.status == "failed", 1))).label("failed"),
    )
    if msg_conditions:
        msg_query = msg_query.where(and_(*msg_conditions))

    msg_result = await db.execute(msg_query)
    msg_row = msg_result.one()

    # Active carriers
    carrier_result = await db.execute(
        select(func.count(Carrier.id)).where(Carrier.status == "active")
    )
    active_carriers = carrier_result.scalar()

    total_calls = call_row.total or 0
    successful_calls = call_row.successful or 0
    total_messages = msg_row.total or 0
    successful_messages = msg_row.successful or 0

    return {
        "total_calls": total_calls,
        "successful_calls": successful_calls,
        "failed_calls": call_row.failed or 0,
        "call_success_rate": round((successful_calls / total_calls * 100) if total_calls > 0 else 0, 2),
        "total_messages": total_messages,
        "successful_messages": successful_messages,
        "failed_messages": msg_row.failed or 0,
        "message_success_rate": round((successful_messages / total_messages * 100) if total_messages > 0 else 0, 2),
        "avg_call_duration": round(float(call_row.avg_duration), 2),
        "active_carriers": active_carriers or 0,
    }


async def get_trends(
    db: AsyncSession,
    *,
    time_from: Optional[datetime] = None,
    time_to: Optional[datetime] = None,
    granularity: str = "day",
):
    # Call trends
    call_conditions = []
    if time_from:
        call_conditions.append(CallLog.initiated_at >= time_from)
    if time_to:
        call_conditions.append(CallLog.initiated_at <= time_to)

    call_bucket = func.date_trunc(granularity, CallLog.initiated_at).label("bucket")
    call_query = (
        select(
            call_bucket,
            func.count(CallLog.id).label("total"),
            func.count(case((CallLog.status == "completed", 1))).label("successful"),
            func.count(case((CallLog.status == "failed", 1))).label("failed"),
        )
        .group_by(call_bucket)
        .order_by(call_bucket)
    )
    if call_conditions:
        call_query = call_query.where(and_(*call_conditions))

    call_result = await db.execute(call_query)
    call_trends = [
        {
            "timestamp": row.bucket.isoformat(),
            "total": row.total,
            "successful": row.successful,
            "failed": row.failed,
        }
        for row in call_result.all()
    ]

    # Message trends
    msg_conditions = []
    if time_from:
        msg_conditions.append(MessageLog.sent_at >= time_from)
    if time_to:
        msg_conditions.append(MessageLog.sent_at <= time_to)

    msg_bucket = func.date_trunc(granularity, MessageLog.sent_at).label("bucket")
    msg_query = (
        select(
            msg_bucket,
            func.count(MessageLog.id).label("total"),
            func.count(case((MessageLog.status == "delivered", 1))).label("successful"),
            func.count(case((MessageLog.status == "failed", 1))).label("failed"),
        )
        .group_by(msg_bucket)
        .order_by(msg_bucket)
    )
    if msg_conditions:
        msg_query = msg_query.where(and_(*msg_conditions))

    msg_result = await db.execute(msg_query)
    msg_trends = [
        {
            "timestamp": row.bucket.isoformat(),
            "total": row.total,
            "successful": row.successful,
            "failed": row.failed,
        }
        for row in msg_result.all()
    ]

    return {"calls": call_trends, "messages": msg_trends}


async def get_carrier_performance(
    db: AsyncSession,
    *,
    time_from: Optional[datetime] = None,
    time_to: Optional[datetime] = None,
):
    # Call stats per carrier
    call_conditions = []
    if time_from:
        call_conditions.append(CallLog.initiated_at >= time_from)
    if time_to:
        call_conditions.append(CallLog.initiated_at <= time_to)

    call_query = (
        select(
            CallLog.carrier.label("carrier_name"),
            func.count(CallLog.id).label("total_calls"),
            func.count(case((CallLog.status == "completed", 1))).label("successful_calls"),
            func.count(case((CallLog.status == "failed", 1))).label("failed_calls"),
            func.coalesce(func.avg(CallLog.duration), 0).label("avg_duration"),
        )
        .group_by(CallLog.carrier)
    )
    if call_conditions:
        call_query = call_query.where(and_(*call_conditions))

    call_result = await db.execute(call_query)
    call_data = {row.carrier_name: row for row in call_result.all()}

    # Message stats per carrier
    msg_conditions = []
    if time_from:
        msg_conditions.append(MessageLog.sent_at >= time_from)
    if time_to:
        msg_conditions.append(MessageLog.sent_at <= time_to)

    msg_query = (
        select(
            MessageLog.carrier.label("carrier_name"),
            func.count(MessageLog.id).label("total_messages"),
            func.count(case((MessageLog.status == "delivered", 1))).label("successful_messages"),
        )
        .group_by(MessageLog.carrier)
    )
    if msg_conditions:
        msg_query = msg_query.where(and_(*msg_conditions))

    msg_result = await db.execute(msg_query)
    msg_data = {row.carrier_name: row for row in msg_result.all()}

    # Combine
    all_carriers = set(list(call_data.keys()) + list(msg_data.keys()))
    results = []
    for carrier_name in sorted(all_carriers):
        c = call_data.get(carrier_name)
        m = msg_data.get(carrier_name)

        total_calls = c.total_calls if c else 0
        successful_calls = c.successful_calls if c else 0
        total_messages = m.total_messages if m else 0
        successful_messages = m.successful_messages if m else 0

        results.append({
            "carrier_name": carrier_name,
            "total_calls": total_calls,
            "successful_calls": successful_calls,
            "failed_calls": c.failed_calls if c else 0,
            "success_rate": round((successful_calls / total_calls * 100) if total_calls > 0 else 0, 2),
            "avg_duration": round(float(c.avg_duration) if c else 0, 2),
            "total_messages": total_messages,
            "message_success_rate": round((successful_messages / total_messages * 100) if total_messages > 0 else 0, 2),
        })

    return results


async def get_error_distribution(
    db: AsyncSession,
    *,
    time_from: Optional[datetime] = None,
    time_to: Optional[datetime] = None,
):
    # Call error distribution
    call_conditions = [CallLog.error_code.isnot(None), CallLog.error_code != ""]
    if time_from:
        call_conditions.append(CallLog.initiated_at >= time_from)
    if time_to:
        call_conditions.append(CallLog.initiated_at <= time_to)

    call_query = (
        select(
            CallLog.error_code,
            func.count(CallLog.id).label("count"),
        )
        .where(and_(*call_conditions))
        .group_by(CallLog.error_code)
        .order_by(func.count(CallLog.id).desc())
    )

    call_result = await db.execute(call_query)
    call_rows = call_result.all()

    call_total = sum(row.count for row in call_rows) if call_rows else 0
    call_errors = [
        {
            "error_code": row.error_code,
            "error_message": "",
            "count": row.count,
            "percentage": round((row.count / call_total * 100) if call_total > 0 else 0, 2),
        }
        for row in call_rows
    ]

    # Message error distribution
    msg_conditions = [MessageLog.error_code.isnot(None), MessageLog.error_code != ""]
    if time_from:
        msg_conditions.append(MessageLog.sent_at >= time_from)
    if time_to:
        msg_conditions.append(MessageLog.sent_at <= time_to)

    msg_query = (
        select(
            MessageLog.error_code,
            func.count(MessageLog.id).label("count"),
        )
        .where(and_(*msg_conditions))
        .group_by(MessageLog.error_code)
        .order_by(func.count(MessageLog.id).desc())
    )

    msg_result = await db.execute(msg_query)
    msg_rows = msg_result.all()

    msg_total = sum(row.count for row in msg_rows) if msg_rows else 0
    message_errors = [
        {
            "error_code": row.error_code,
            "error_message": "",
            "count": row.count,
            "percentage": round((row.count / msg_total * 100) if msg_total > 0 else 0, 2),
        }
        for row in msg_rows
    ]

    return {"call_errors": call_errors, "message_errors": message_errors}
