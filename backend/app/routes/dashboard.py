from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date

from app.database import get_db
from app.core.deps import get_current_user
from app.models.cita import Cita, EstadoCita
from app.models.user import User

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    total = db.query(func.count(Cita.id)).scalar() or 0

    hoy = (
        db.query(func.count(Cita.id))
        .filter(func.date(Cita.fecha_hora_inicio) == today)
        .scalar() or 0
    )

    semana = (
        db.query(func.count(Cita.id))
        .filter(func.date(Cita.fecha_hora_inicio) >= week_start)
        .scalar() or 0
    )

    completadas = (
        db.query(func.count(Cita.id))
        .filter(Cita.estado == EstadoCita.completada)
        .scalar() or 0
    )

    pendientes = (
        db.query(func.count(Cita.id))
        .filter(Cita.estado == EstadoCita.pendiente)
        .scalar() or 0
    )

    confirmadas = (
        db.query(func.count(Cita.id))
        .filter(Cita.estado == EstadoCita.confirmada)
        .scalar() or 0
    )

    # Datos semanales para el gráfico (últimos 7 días)
    days_es = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    weekly_data = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count = (
            db.query(func.count(Cita.id))
            .filter(func.date(Cita.fecha_hora_inicio) == d)
            .scalar() or 0
        )
        weekly_data.append({
            "fecha": d.strftime("%d/%m"),
            "dia": days_es[d.weekday()],
            "citas": count,
        })

    return {
        "total": total,
        "hoy": hoy,
        "semana": semana,
        "completadas": completadas,
        "pendientes": pendientes,
        "confirmadas": confirmadas,
        "tasa_completado": round((completadas / total * 100) if total > 0 else 0, 1),
        "weekly_chart": weekly_data,
    }
