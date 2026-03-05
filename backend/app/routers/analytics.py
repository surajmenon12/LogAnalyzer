from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.analytics import OverviewStats, TrendResponse, CarrierPerformance, ErrorDistributionResponse
from app.services.analytics_service import get_overview_stats, get_trends, get_carrier_performance, get_error_distribution

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview", response_model=OverviewStats)
async def overview(
    time_from: Optional[datetime] = Query(None),
    time_to: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await get_overview_stats(db, time_from=time_from, time_to=time_to)


@router.get("/trends", response_model=TrendResponse)
async def trends(
    time_from: Optional[datetime] = Query(None),
    time_to: Optional[datetime] = Query(None),
    granularity: str = Query("day"),
    db: AsyncSession = Depends(get_db),
):
    return await get_trends(db, time_from=time_from, time_to=time_to, granularity=granularity)


@router.get("/carriers", response_model=List[CarrierPerformance])
async def carrier_performance(
    time_from: Optional[datetime] = Query(None),
    time_to: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await get_carrier_performance(db, time_from=time_from, time_to=time_to)


@router.get("/error-distribution", response_model=ErrorDistributionResponse)
async def error_distribution(
    time_from: Optional[datetime] = Query(None),
    time_to: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await get_error_distribution(db, time_from=time_from, time_to=time_to)
