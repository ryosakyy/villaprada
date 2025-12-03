# backend/models/usuarios.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime

from core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)

    # Datos
    nombres = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)

    # Contraseña hasheada
    password_hash = Column(String(200), nullable=False)

    # Rol y estado
    rol = Column(String(20), default="admin")
    estado = Column(Boolean, default=True)

    # Auditoría
    fecha_creacion = Column(DateTime, default=datetime.utcnow)


