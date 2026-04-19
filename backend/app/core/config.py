import os
from pydantic_settings import BaseSettings

# Ruta absoluta de la base de datos
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_FILE = os.path.join(BACKEND_DIR, "agendamiento.db").replace("\\", "/")


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sistema de Agendamiento Pro"
    VERSION: str = "2.0.0"
    SECRET_KEY: str = "changeme-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 días
    DATABASE_URL: str = f"sqlite://///{DB_FILE}" if DB_FILE.startswith("c:") else f"sqlite:///{DB_FILE}"

    class Config:
        env_file = ".env"


settings = Settings()
