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
    duration: Optional[int] = None
    bill_duration: Optional[int] = None
    hangup_initiator: Optional[str] = None
    rate: Optional[float] = None
    amount: Optional[float] = None
    call_id: Optional[str] = None
    carrier: str
    region: str
    from_country: Optional[str] = None
    to_country: Optional[str] = None
    transport_protocol: Optional[str] = None
    srtp: Optional[bool] = None
    secure_trunking: Optional[bool] = None
    secure_trunking_rate: Optional[float] = None
    stir_verification: Optional[str] = None
    attestation_indicator: Optional[str] = None
    cnam_lookup_number_config: Optional[str] = None
    cnam_lookup_customer_rate: Optional[float] = None
    answer_time: Optional[datetime] = None
    initiated_at: datetime
    ended_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
