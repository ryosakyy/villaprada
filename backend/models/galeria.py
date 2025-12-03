from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base


class Galeria(Base):
    __tablename__ = "galeria"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    categoria = Column(String(50), nullable=True)  # bodas, xv, corporativo, etc.

    imagen_url = Column(String(500), nullable=False)   # URL pública de Cloudinary
    public_id = Column(String(200), nullable=False)    # public_id para borrar en Cloudinary

    contrato_id = Column(Integer, ForeignKey("contratos.id"), nullable=True)

    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
