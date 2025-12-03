# backend/core/config.py
from dotenv import load_dotenv
import os

# Cargar variables desde el archivo .env
load_dotenv()

class Settings:
    # ---------- BASE DE DATOS ----------
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_NAME: str = os.getenv("DB_NAME", "villa_prada")

    # ---------- JWT / SEGURIDAD ----------
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "CAMBIA_ESTA_CLAVE")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))

    # ---------- RENIEC (API externa) ----------
    RENIEC_URL: str = os.getenv("RENIEC_URL", "")
    RENIEC_TOKEN: str = os.getenv("RENIEC_TOKEN", "")

    # ---------- APP ----------
    APP_NAME: str = os.getenv("APP_NAME", "Sistema Villa Prada")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"


# Instancia global de configuración
settings = Settings()
