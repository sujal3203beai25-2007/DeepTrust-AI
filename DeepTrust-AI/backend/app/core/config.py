import os
import secrets
from typing import Optional
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR = BASE_DIR / "generated_reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "DeepTrust AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # SQLite async database (zero setup, robust, compatible everywhere)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR / 'deeptrust.db'}")
    
    UPLOAD_DIR: Path = UPLOAD_DIR
    REPORTS_DIR: Path = REPORTS_DIR

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # SMTP Email Configuration (None enables local dev email capture)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", None)
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "security@deeptrust.ai")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "DeepTrust AI Security")

    class Config:
        env_file = ".env"

# Persist a local development key across restarts; production must supply SECRET_KEY.
_env_path = BASE_DIR / ".env"
if not os.getenv("SECRET_KEY") and not _env_path.exists():
    _env_path.write_text(f"SECRET_KEY={secrets.token_urlsafe(48)}\n", encoding="utf-8")
settings = Settings()
if not settings.SECRET_KEY:
    raise RuntimeError("SECRET_KEY must be set in backend/.env or environment")
