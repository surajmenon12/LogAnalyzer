from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CallLogResponse(BaseModel):
    id: int
    uuid: str
    from_number: str
    to_number: str
    direction: str
    status: str
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    duration: Optional[int] = None
    region: str
    carrier: str
    initiated_at: datetime
    ended_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
