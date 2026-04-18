from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class EstadoCita(str, enum.Enum):
    pendiente = "pendiente"
    confirmada = "confirmada"
    completada = "completada"
    cancelada = "cancelada"
    no_asistio = "no_asistio"


class Cita(Base):
    __tablename__ = "citas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=True)

    # Datos del cliente (para walk-ins sin cuenta)
    nombre_cliente = Column(String(100), nullable=False)
    email_cliente = Column(String(200), nullable=True)
    telefono_cliente = Column(String(20), nullable=True)

    fecha_hora_inicio = Column(DateTime, nullable=False)
    fecha_hora_fin = Column(DateTime, nullable=True)

    estado = Column(SAEnum(EstadoCita), default=EstadoCita.pendiente)
    notas = Column(Text, nullable=True)
    notas_internas = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("User", back_populates="citas", foreign_keys=[usuario_id])
    servicio = relationship("Servicio", back_populates="citas")
