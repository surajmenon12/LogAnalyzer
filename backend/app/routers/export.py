from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.export_service import export_calls_csv, export_messages_csv, export_sip_trunks_csv

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.get("/csv")
async def export_csv(
    type: str = Query(..., description="calls, messages, or sip-trunks"),
    time_from: Optional[datetime] = Query(None),
    time_to: Optional[datetime] = Query(None),
    region: Optional[str] = Query(None),
    carrier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    kwargs = dict(time_from=time_from, time_to=time_to, region=region, carrier=carrier, status=status)

    if type == "calls":
        return await export_calls_csv(db, **kwargs)
    elif type == "messages":
        return await export_messages_csv(db, **kwargs)
    elif type == "sip-trunks":
        return await export_sip_trunks_csv(db, **kwargs)
    else:
        raise HTTPException(status_code=400, detail=f"Invalid export type: {type}")
