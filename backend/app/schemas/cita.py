from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

from app.models.cita import EstadoCita
from app.schemas.servicio import ServicioResponse


class CitaBase(BaseModel):
    nombre_cliente: str
    email_cliente: Optional[str] = None
    telefono_cliente: Optional[str] = None
    fecha_hora_inicio: datetime
    fecha_hora_fin: Optional[datetime] = None
    notas: Optional[str] = None
    servicio_id: Optional[int] = None


class CitaCreate(CitaBase):
    pass


class CitaUpdate(BaseModel):
    nombre_cliente: Optional[str] = None
    email_cliente: Optional[str] = None
    telefono_cliente: Optional[str] = None
    fecha_hora_inicio: Optional[datetime] = None
    fecha_hora_fin: Optional[datetime] = None
    estado: Optional[EstadoCita] = None
    notas: Optional[str] = None
    notas_internas: Optional[str] = None
    servicio_id: Optional[int] = None


class CitaResponse(CitaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    estado: EstadoCita
    notas_internas: Optional[str] = None
    usuario_id: Optional[int] = None
    servicio: Optional[ServicioResponse] = None
    created_at: datetime
    updated_at: datetime
