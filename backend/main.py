from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import auth, users, servicios, citas, dashboard
from app.core.config import settings

# Crear todas las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API REST para el Sistema de Agendamiento Profesional",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS para permitir el frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/v1/auth",      tags=["Autenticación"])
app.include_router(users.router,      prefix="/api/v1/users",     tags=["Usuarios"])
app.include_router(servicios.router,  prefix="/api/v1/servicios", tags=["Servicios"])
app.include_router(citas.router,      prefix="/api/v1/citas",     tags=["Citas"])
app.include_router(dashboard.router,  prefix="/api/v1/dashboard", tags=["Dashboard"])


@app.get("/api/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "version": settings.VERSION}
