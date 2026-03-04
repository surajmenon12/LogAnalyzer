import uuid as uuid_lib

from sqlalchemy import Column, Integer, String, Float, DateTime

from app.models.base import Base, TimestampMixin


class CallLog(Base, TimestampMixin):
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), default=lambda: str(uuid_lib.uuid4()), unique=True, nullable=False, index=True)
    from_number = Column(String(20), nullable=False)
    to_number = Column(String(20), nullable=False)
    direction = Column(String(10), nullable=False)  # "inbound", "outbound"
    status = Column(String(20), nullable=False, index=True)  # "completed", "failed", "busy", "no-answer", "cancelled"
    error_code = Column(String(10), nullable=True)
    error_message = Column(String(255), nullable=True)
    duration = Column(Integer, nullable=True)  # seconds
    region = Column(String(50), nullable=False, index=True)
    carrier = Column(String(100), nullable=False, index=True)
    initiated_at = Column(DateTime(timezone=True), nullable=False, index=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
