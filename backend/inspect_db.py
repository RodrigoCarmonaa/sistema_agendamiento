"""
Script para inspeccionar la base de datos del sistema de agendamiento.
Ejecutar: python inspect_db.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.servicio import Servicio
from app.models.cita import Cita

db = SessionLocal()

# ── Usuarios ───────────────────────────────────────────
print("\n" + "="*60)
print("  USUARIOS")
print("="*60)
users = db.query(User).all()
print(f"  Total: {len(users)}")
for u in users:
    print(f"  [{u.id}] {u.nombre} | {u.email} | rol={u.role} | activo={u.is_active}")

# ── Servicios ──────────────────────────────────────────
print("\n" + "="*60)
print("  SERVICIOS")
print("="*60)
servicios = db.query(Servicio).all()
print(f"  Total: {len(servicios)}")
for s in servicios:
    precio_str = f"${s.precio}" if s.precio else "sin precio"
    print(f"  [{s.id}] {s.nombre} | {s.duracion_minutos} min | {precio_str} | color={s.color}")

# ── Citas ──────────────────────────────────────────────
print("\n" + "="*60)
print("  CITAS")
print("="*60)
citas = db.query(Cita).all()
print(f"  Total: {len(citas)}")
for c in citas:
    servicio_name = c.servicio.nombre if c.servicio else "sin servicio"
    print(f"  [{c.id}] {c.nombre_cliente} | {c.fecha_hora_inicio} | estado={c.estado} | servicio={servicio_name}")

print("\n" + "="*60 + "\n")
db.close()
