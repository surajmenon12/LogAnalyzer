import math
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.sip_trunk_log import SIPTrunkLogResponse
from app.services.sip_trunk_service import get_sip_trunk_logs

router = APIRouter(prefix="/api/logs", tags=["SIP Trunk Logs"])


@router.get("/sip-trunks", response_model=PaginatedResponse[SIPTrunkLogResponse])
async def list_sip_trunk_logs(
    time_from: Optional[datetime] = Query(None),
    time_to: Optional[datetime] = Query(None),
    region: Optional[str] = Query(None),
    carrier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    sort_by: str = Query("recorded_at"),
    sort_order: str = Query("desc"),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_sip_trunk_logs(
        db,
        time_from=time_from,
        time_to=time_to,
        region=region,
        carrier=carrier,
        status=status,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )
