from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional

from app.models.call_log import CallLog


async def get_call_logs(
    db: AsyncSession,
    *,
    time_from: Optional[datetime] = None,
    time_to: Optional[datetime] = None,
    region: Optional[str] = None,
    carrier: Optional[str] = None,
    status: Optional[str] = None,
    error_code: Optional[str] = None,
    page: int = 1,
    page_size: int = 25,
    sort_by: str = "initiated_at",
    sort_order: str = "desc",
):
    query = select(CallLog)
    count_query = select(func.count(CallLog.id))

    conditions = []
    if time_from:
        conditions.append(CallLog.initiated_at >= time_from)
    if time_to:
        conditions.append(CallLog.initiated_at <= time_to)
    if region:
        conditions.append(CallLog.region == region)
    if carrier:
        conditions.append(CallLog.carrier == carrier)
    if status:
        conditions.append(CallLog.status == status)
    if error_code:
        conditions.append(CallLog.error_code == error_code)

    if conditions:
        query = query.where(and_(*conditions))
        count_query = count_query.where(and_(*conditions))

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    sort_column = getattr(CallLog, sort_by, CallLog.initiated_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    items = result.scalars().all()

    return items, total
