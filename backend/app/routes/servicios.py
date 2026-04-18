from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.core.deps import get_current_user, get_admin_user
from app.models.servicio import Servicio
from app.models.user import User
from app.schemas.servicio import ServicioCreate, ServicioUpdate, ServicioResponse

router = APIRouter()


@router.get("/", response_model=List[ServicioResponse])
def list_servicios(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Servicio).filter(Servicio.is_active == True).all()


@router.post("/", response_model=ServicioResponse, status_code=201)
def create_servicio(data: ServicioCreate, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    servicio = Servicio(**data.model_dump())
    db.add(servicio)
    db.commit()
    db.refresh(servicio)
    return servicio


@router.get("/{servicio_id}", response_model=ServicioResponse)
def get_servicio(servicio_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio


@router.put("/{servicio_id}", response_model=ServicioResponse)
def update_servicio(
    servicio_id: int,
    data: ServicioUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(servicio, key, value)
    db.commit()
    db.refresh(servicio)
    return servicio


@router.delete("/{servicio_id}")
def delete_servicio(servicio_id: int, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    servicio.is_active = False
    db.commit()
    return {"message": "Servicio eliminado"}
