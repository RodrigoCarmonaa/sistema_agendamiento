from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date

from app.database import get_db
from app.core.deps import get_current_user
from app.models.cita import Cita, EstadoCita
from app.models.user import User
from app.schemas.cita import CitaCreate, CitaUpdate, CitaResponse

router = APIRouter()


def _load_cita(db: Session, cita_id: int, current_user: Optional[User] = None) -> Cita:
    cita = (
        db.query(Cita)
        .options(joinedload(Cita.servicio))
        .filter(Cita.id == cita_id)
        .first()
    )
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    
    # Verificar que la cita pertenezca al usuario actual (si se proporciona)
    if current_user and cita.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta cita")
    
    return cita


@router.get("/", response_model=List[CitaResponse])
def list_citas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    estado: Optional[EstadoCita] = None,
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
    skip: int = 0,
    limit: int = 200,
):
    query = db.query(Cita).options(joinedload(Cita.servicio))
    # Filtrar por usuario actual
    query = query.filter(Cita.usuario_id == current_user.id)
    if estado:
        query = query.filter(Cita.estado == estado)
    if fecha_desde:
        query = query.filter(Cita.fecha_hora_inicio >= datetime.combine(fecha_desde, datetime.min.time()))
    if fecha_hasta:
        query = query.filter(Cita.fecha_hora_inicio <= datetime.combine(fecha_hasta, datetime.max.time()))
    return query.order_by(Cita.fecha_hora_inicio.asc()).offset(skip).limit(limit).all()


@router.post("/", response_model=CitaResponse, status_code=201)
def create_cita(
    data: CitaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verificar conflicto de horario
    conflict = (
        db.query(Cita)
        .filter(
            Cita.fecha_hora_inicio == data.fecha_hora_inicio,
            Cita.estado.notin_([EstadoCita.cancelada]),
        )
        .first()
    )
    if conflict:
        raise HTTPException(
            status_code=400,
            detail=f"El horario {data.fecha_hora_inicio.strftime('%d/%m/%Y %H:%M')} ya está ocupado",
        )

    cita = Cita(**data.model_dump(), usuario_id=current_user.id)
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return _load_cita(db, cita.id)


@router.get("/{cita_id}", response_model=CitaResponse)
def get_cita(cita_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _load_cita(db, cita_id, current_user)


@router.put("/{cita_id}", response_model=CitaResponse)
def update_cita(
    cita_id: int,
    data: CitaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cita = _load_cita(db, cita_id, current_user)
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(cita, key, value)
    cita.updated_at = datetime.utcnow()
    db.commit()
    return _load_cita(db, cita_id, current_user)


@router.patch("/{cita_id}/estado", response_model=CitaResponse)
def change_estado(
    cita_id: int,
    estado: EstadoCita,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cita = _load_cita(db, cita_id, current_user)
    cita.estado = estado
    cita.updated_at = datetime.utcnow()
    db.commit()
    return _load_cita(db, cita_id, current_user)


@router.delete("/{cita_id}")
def delete_cita(cita_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cita = _load_cita(db, cita_id, current_user)
    db.delete(cita)
    db.commit()
    return {"message": "Cita eliminada correctamente"}
