from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    staff = "staff"
    client = "client"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    telefono = Column(String(20), nullable=True)
    hashed_password = Column(String(200), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.client, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    citas = relationship("Cita", back_populates="usuario", foreign_keys="Cita.usuario_id")
