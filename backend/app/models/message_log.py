import uuid as uuid_lib

from sqlalchemy import Column, Integer, String, DateTime

from app.models.base import Base, TimestampMixin


class MessageLog(Base, TimestampMixin):
    __tablename__ = "message_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), default=lambda: str(uuid_lib.uuid4()), unique=True, nullable=False, index=True)
    from_number = Column(String(20), nullable=False)
    to_number = Column(String(20), nullable=False)
    direction = Column(String(10), nullable=False)  # "inbound", "outbound"
    status = Column(String(20), nullable=False, index=True)  # "delivered", "failed", "queued", "sent", "undelivered"
    error_code = Column(String(10), nullable=True)
    error_message = Column(String(255), nullable=True)
    message_type = Column(String(10), nullable=False)  # "sms", "mms"
    units = Column(Integer, default=1)
    region = Column(String(50), nullable=False, index=True)
    carrier = Column(String(100), nullable=False, index=True)
    sent_at = Column(DateTime(timezone=True), nullable=False, index=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
