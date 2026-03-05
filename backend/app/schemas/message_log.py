from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MessageLogResponse(BaseModel):
    id: int
    uuid: str
    subaccount: Optional[str] = None
    from_number: str
    replaced_sender: Optional[str] = None
    to_number: str
    direction: str
    status: str
    units: int
    amount: Optional[float] = None
    message_rate: Optional[float] = None
    message_charge: Optional[float] = None
    carrier: str
    kannel_message_id: Optional[str] = None
    error_code: Optional[str] = None
    powerpack_id: Optional[str] = None
    requester_ip: Optional[str] = None
    is_domestic: bool
    senderid_usecase: Optional[str] = None
    waba_id: Optional[str] = None
    waba_name: Optional[str] = None
    conversation_id: Optional[str] = None
    conversation_origin: Optional[str] = None
    conversation_expiry: Optional[datetime] = None
    surcharge_rate: Optional[float] = None
    mno: Optional[str] = None
    is_10dlc_registered: bool
    campaign_id: Optional[str] = None
    region: Optional[str] = None
    message_type: str
    carrier_error_code: Optional[str] = None
    sent_at: datetime
    delivered_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
