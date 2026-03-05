import csv
import io
from datetime import datetime
from typing import Optional

from fastapi.responses import StreamingResponse
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.call_log import CallLog
from app.models.message_log import MessageLog


def _build_conditions(model, time_field, *, time_from=None, time_to=None, region=None, carrier=None, status=None):
    conditions = []
    if time_from:
        conditions.append(time_field >= time_from)
    if time_to:
        conditions.append(time_field <= time_to)
    if region:
        conditions.append(model.region == region)
    if carrier:
        conditions.append(model.carrier == carrier)
    if status:
        conditions.append(model.status == status)
    return conditions


async def export_calls_csv(
    db: AsyncSession,
    *,
    time_from: Optional[datetime] = None,
    time_to: Optional[datetime] = None,
    region: Optional[str] = None,
    carrier: Optional[str] = None,
    status: Optional[str] = None,
):
    query = select(CallLog).order_by(CallLog.initiated_at.desc())
    conditions = _build_conditions(CallLog, CallLog.initiated_at, time_from=time_from, time_to=time_to, region=region, carrier=carrier, status=status)
    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(query)
    rows = result.scalars().all()

    def generate():
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["UUID", "From", "To", "Direction", "Status", "Error Code", "Error Message", "Duration (s)", "Region", "Carrier", "Initiated At", "Ended At"])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for row in rows:
            writer.writerow([
                row.uuid, row.from_number, row.to_number, row.direction,
                row.status, row.error_code or "", row.error_message or "",
                row.duration or "", row.region, row.carrier,
                row.initiated_at.isoformat(), row.ended_at.isoformat() if row.ended_at else "",
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    return StreamingResponse(generate(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=call_logs.csv"})


async def export_messages_csv(
    db: AsyncSession,
    *,
    time_from: Optional[datetime] = None,
    time_to: Optional[datetime] = None,
    region: Optional[str] = None,
    carrier: Optional[str] = None,
    status: Optional[str] = None,
):
    query = select(MessageLog).order_by(MessageLog.sent_at.desc())
    conditions = _build_conditions(MessageLog, MessageLog.sent_at, time_from=time_from, time_to=time_to, region=region, carrier=carrier, status=status)
    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(query)
    rows = result.scalars().all()

    def generate():
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["UUID", "From", "To", "Direction", "Status", "Error Code", "Error Message", "Type", "Units", "Region", "Carrier", "Sent At", "Delivered At"])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for row in rows:
            writer.writerow([
                row.uuid, row.from_number, row.to_number, row.direction,
                row.status, row.error_code or "", row.error_message or "",
                row.message_type, row.units, row.region, row.carrier,
                row.sent_at.isoformat(), row.delivered_at.isoformat() if row.delivered_at else "",
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    return StreamingResponse(generate(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=message_logs.csv"})
