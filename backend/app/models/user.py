from sqlalchemy import Column, Integer, String, Boolean

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="viewer")  # "admin", "analyst", "viewer"
    is_active = Column(Boolean, default=True)
