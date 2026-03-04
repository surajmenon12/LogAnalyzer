from sqlalchemy import Column, Integer, String, Float, DateTime

from app.models.base import Base, TimestampMixin


class SIPTrunkLog(Base, TimestampMixin):
    __tablename__ = "sip_trunk_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trunk_name = Column(String(100), nullable=False, index=True)
    status = Column(String(20), nullable=False, index=True)  # "healthy", "degraded", "down"
    error_code = Column(String(10), nullable=True)
    error_message = Column(String(255), nullable=True)
    latency_ms = Column(Float, nullable=False)
    packet_loss_pct = Column(Float, nullable=False)
    jitter_ms = Column(Float, nullable=False)
    region = Column(String(50), nullable=False, index=True)
    carrier = Column(String(100), nullable=False, index=True)
    recorded_at = Column(DateTime(timezone=True), nullable=False, index=True)
