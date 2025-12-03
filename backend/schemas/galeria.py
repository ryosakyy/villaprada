
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class GaleriaBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    contrato_id: Optional[int] = None


class GaleriaCreate(GaleriaBase):
    # La imagen viene como archivo en el endpoint (UploadFile), no en el schema
    pass


class GaleriaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    contrato_id: Optional[int] = None


class GaleriaResponse(GaleriaBase):
    id: int
    imagen_url: str
    public_id: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True  # equivalente a orm_mode=True en Pydantic v2
