from pydantic import BaseModel
from datetime import datetime


class CarrierResponse(BaseModel):
    id: int
    name: str
    type: str
    region: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
