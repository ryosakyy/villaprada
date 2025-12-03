from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from core.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String(20), nullable=False)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=True)
    correo = Column(String(100), nullable=True)
    direccion = Column(String(150), nullable=True)
    fecha_registro = Column(DateTime, default=datetime.now)
