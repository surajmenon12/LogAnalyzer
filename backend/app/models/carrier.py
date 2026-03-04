from sqlalchemy import Column, Integer, String

from app.models.base import Base, TimestampMixin


class Carrier(Base, TimestampMixin):
    __tablename__ = "carriers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    type = Column(String(50), nullable=False)  # "voice", "sms", "both"
    region = Column(String(50), nullable=False)  # "US-East", "US-West", "EU-West", "APAC"
    status = Column(String(20), nullable=False, default="active")
