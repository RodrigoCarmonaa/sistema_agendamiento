from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sistema de Agendamiento Pro"
    VERSION: str = "2.0.0"
    SECRET_KEY: str = "changeme-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 días
    DATABASE_URL: str = "sqlite:///./agendamiento.db"

    class Config:
        env_file = ".env"


settings = Settings()
