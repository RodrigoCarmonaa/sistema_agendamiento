from pydantic import BaseModel, ConfigDict
from typing import Optional


class ServicioBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    duracion_minutos: int = 60
    precio: Optional[float] = None
    color: str = "#7c3aed"


class ServicioCreate(ServicioBase):
    pass


class ServicioUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    duracion_minutos: Optional[int] = None
    precio: Optional[float] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None


class ServicioResponse(ServicioBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
