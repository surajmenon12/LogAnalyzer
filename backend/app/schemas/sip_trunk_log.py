from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SIPTrunkLogResponse(BaseModel):
    id: int
    trunk_name: str
    status: str
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    latency_ms: float
    packet_loss_pct: float
    jitter_ms: float
    region: str
    carrier: str
    recorded_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
