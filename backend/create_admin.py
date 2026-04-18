"""
Script de inicializacion: crea el admin y datos de demo.
Ejecutar: python create_admin.py
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.servicio import Servicio
from app.core.security import get_password_hash

# Crear tablas
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# --- Crear usuario administrador ---
admin = db.query(User).filter(User.email == "admin@agendamiento.com").first()
if not admin:
    admin = User(
        nombre="Administrador",
        email="admin@agendamiento.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.admin,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print("OK Admin creado -> admin@agendamiento.com / admin123")
else:
    print("INFO Admin ya existe")

# --- Servicios de ejemplo ---
servicios_demo = [
    {"nombre": "Consulta Inicial",    "descripcion": "Primera consulta con el especialista", "duracion_minutos": 45, "precio": 50.0,  "color": "#7c3aed"},
    {"nombre": "Revision Completa",   "descripcion": "Revision integral del paciente",        "duracion_minutos": 60, "precio": 80.0,  "color": "#2563eb"},
    {"nombre": "Seguimiento",         "descripcion": "Consulta de seguimiento rapida",         "duracion_minutos": 20, "precio": 30.0,  "color": "#059669"},
    {"nombre": "Consulta Urgente",    "descripcion": "Atencion prioritaria",                   "duracion_minutos": 30, "precio": 70.0,  "color": "#dc2626"},
    {"nombre": "Valoracion Online",   "descripcion": "Videoconsulta",                         "duracion_minutos": 30, "precio": 40.0,  "color": "#d97706"},
]

for s in servicios_demo:
    if not db.query(Servicio).filter(Servicio.nombre == s["nombre"]).first():
        db.add(Servicio(**s))

db.commit()
print("OK Servicios de ejemplo creados")
db.close()

print("")
print("Base de datos lista!")
print("  Backend:  uvicorn main:app --reload")
print("  Docs:     http://localhost:8000/api/docs")
