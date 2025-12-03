from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime
from core.database import Base

class Paquete(Base):
    __tablename__ = "paquetes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=False)
    capacidad = Column(Integer, nullable=False)
    servicios = Column(Text, nullable=True)  # lista de items separados por salto de línea
    imagen = Column(String(200), nullable=True)
    estado = Column(String(20), default="activo")
    fecha_creacion = Column(DateTime, default=datetime.now)
