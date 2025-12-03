# backend/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# ---------- URL de conexión MySQL / XAMPP ----------
# Ejemplo: mysql+pymysql://root:@localhost/villa_prada
DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:"
    f"{settings.DB_PASSWORD}@{settings.DB_HOST}/"
    f"{settings.DB_NAME}"
)

# ---------- Motor de base de datos ----------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # Verifica conexiones antes de usarlas
    pool_recycle=280      # Evita que se "mueran" por timeout
)

# ---------- ORM Base ----------
# De aquí heredarán TODOS tus modelos (Usuarios, Clientes, Contratos, etc.)
Base = declarative_base()

# ---------- SessionLocal para usar en los endpoints ----------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependencia para FastAPI (inyectar la sesión en los endpoints)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Función opcional para probar la conexión
def test_connection():
    try:
        with engine.connect() as conn:
            print("✅ Conexión correcta a MySQL (XAMPP) ->", settings.DB_NAME)
    except Exception as e:
        print("❌ Error de conexión a la base de datos:", e)
