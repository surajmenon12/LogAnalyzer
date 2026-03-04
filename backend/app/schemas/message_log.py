from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MessageLogResponse(BaseModel):
    id: int
    uuid: str
    from_number: str
    to_number: str
    direction: str
    status: str
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    message_type: str
    units: int
    region: str
    carrier: str
    sent_at: datetime
    delivered_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
