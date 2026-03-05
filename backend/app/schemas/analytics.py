from pydantic import BaseModel
from typing import List


class OverviewStats(BaseModel):
    total_calls: int
    successful_calls: int
    failed_calls: int
    call_success_rate: float
    total_messages: int
    successful_messages: int
    failed_messages: int
    message_success_rate: float
    avg_call_duration: float
    active_carriers: int


class TrendPoint(BaseModel):
    timestamp: str
    total: int
    successful: int
    failed: int


class TrendResponse(BaseModel):
    calls: List[TrendPoint]
    messages: List[TrendPoint]


class CarrierPerformance(BaseModel):
    carrier_name: str
    total_calls: int
    successful_calls: int
    failed_calls: int
    success_rate: float
    avg_duration: float
    total_messages: int
    message_success_rate: float


class ErrorDistribution(BaseModel):
    error_code: str
    error_message: str
    count: int
    percentage: float


class ErrorDistributionResponse(BaseModel):
    call_errors: List[ErrorDistribution]
    message_errors: List[ErrorDistribution]


class RegionBreakdown(BaseModel):
    region: str
    total: int
    successful: int
    failed: int
    success_rate: float
