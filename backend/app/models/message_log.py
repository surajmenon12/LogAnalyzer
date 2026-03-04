import uuid as uuid_lib

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float

from app.models.base import Base, TimestampMixin


class MessageLog(Base, TimestampMixin):
    __tablename__ = "message_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), default=lambda: str(uuid_lib.uuid4()), unique=True, nullable=False, index=True)
    subaccount = Column(String(100), nullable=True)
    from_number = Column(String(50), nullable=False)
    replaced_sender = Column(String(100), nullable=True)
    to_number = Column(String(50), nullable=False)
    direction = Column(String(50), nullable=False)  # "inbound", "outbound"
    status = Column(String(100), nullable=False, index=True)  # "delivered", "failed", "queued", "sent", "undelivered"
    units = Column(Integer, default=1)
    amount = Column(Float, nullable=True)
    message_rate = Column(Float, nullable=True)
    message_charge = Column(Float, nullable=True)
    carrier = Column(String(100), nullable=False, index=True)
    kannel_message_id = Column(String(255), nullable=True)
    error_code = Column(String(50), nullable=True)
    powerpack_id = Column(String(255), nullable=True)
    requester_ip = Column(String(100), nullable=True)
    is_domestic = Column(Boolean, default=False)
    senderid_usecase = Column(String(255), nullable=True)
    waba_id = Column(String(255), nullable=True)
    waba_name = Column(String(255), nullable=True)
    conversation_id = Column(String(255), nullable=True)
    conversation_origin = Column(String(255), nullable=True)
    conversation_expiry = Column(DateTime(timezone=True), nullable=True)
    surcharge_rate = Column(Float, nullable=True)
    mno = Column(String(255), nullable=True)
    is_10dlc_registered = Column(Boolean, default=False)
    campaign_id = Column(String(255), nullable=True)
    region = Column(String(100), nullable=True, index=True)
    from_country = Column(String(100), nullable=True)
    to_country = Column(String(100), nullable=True)
    message_type = Column(String(50), nullable=False)  # "sms", "mms"
    carrier_error_code = Column(String(50), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=False, index=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
