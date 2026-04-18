from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Servicio(Base):
    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    duracion_minutos = Column(Integer, default=60)
    precio = Column(Float, nullable=True)
    color = Column(String(20), default="#7c3aed")
    is_active = Column(Boolean, default=True)

    citas = relationship("Cita", back_populates="servicio")
