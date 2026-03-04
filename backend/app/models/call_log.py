import uuid as uuid_lib

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean

from app.models.base import Base, TimestampMixin


class CallLog(Base, TimestampMixin):
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), default=lambda: str(uuid_lib.uuid4()), unique=True, nullable=False, index=True)
    from_number = Column(String(50), nullable=False)
    to_number = Column(String(50), nullable=False)
    direction = Column(String(20), nullable=False)  # "inbound", "outbound"
    status = Column(String(100), nullable=False, index=True)  # hangup_cause
    error_code = Column(String(20), nullable=True)  # hangup_code
    duration = Column(Integer, nullable=True)  # bill_duration
    bill_duration = Column(Integer, nullable=True)
    hangup_initiator = Column(String(100), nullable=True)
    rate = Column(Float, nullable=True)
    amount = Column(Float, nullable=True)
    call_id = Column(String(100), nullable=True)
    carrier = Column(String(100), nullable=False, index=True) # trunk_domain
    region = Column(String(50), nullable=False, index=True)
    from_country = Column(String(50), nullable=True)
    to_country = Column(String(50), nullable=True)
    transport_protocol = Column(String(20), nullable=True)
    srtp = Column(Boolean, nullable=True)
    secure_trunking = Column(Boolean, nullable=True)
    secure_trunking_rate = Column(Float, nullable=True)
    stir_verification = Column(String(100), nullable=True)
    attestation_indicator = Column(String(10), nullable=True)
    cnam_lookup_number_config = Column(String(100), nullable=True)
    cnam_lookup_customer_rate = Column(Float, nullable=True)
    answer_time = Column(DateTime(timezone=True), nullable=True)
    initiated_at = Column(DateTime(timezone=True), nullable=False, index=True) # initiation_time
    ended_at = Column(DateTime(timezone=True), nullable=True) # end_time
