from pydantic import BaseModel
from typing import Optional

class PaqueteBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    capacidad: int
    servicios: Optional[str] = None
    imagen: Optional[str] = None
    estado: Optional[str] = "activo"

class PaqueteCreate(PaqueteBase):
    pass

class PaqueteUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    capacidad: Optional[int] = None
    servicios: Optional[str] = None
    imagen: Optional[str] = None
    estado: Optional[str] = None

class PaqueteResponse(PaqueteBase):
    id: int

    class Config:
        from_attributes = True
