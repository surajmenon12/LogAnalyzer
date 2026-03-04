import math
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.call_log import CallLogResponse
from app.schemas.common import PaginatedResponse
from app.services.call_service import get_call_logs

router = APIRouter(prefix="/api/logs", tags=["Call Logs"])


@router.get("/calls", response_model=PaginatedResponse[CallLogResponse])
async def list_call_logs(
    time_from: Optional[datetime] = Query(None),
    time_to: Optional[datetime] = Query(None),
    region: Optional[str] = Query(None),
    carrier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    error_code: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    sort_by: str = Query("initiated_at"),
    sort_order: str = Query("desc"),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_call_logs(
        db,
        time_from=time_from,
        time_to=time_to,
        region=region,
        carrier=carrier,
        status=status,
        error_code=error_code,
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
