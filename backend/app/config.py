from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://plivo:plivo_secret@localhost:5432/log_analyzer"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    APP_TITLE: str = "Plivo Log Analyzer"
    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
