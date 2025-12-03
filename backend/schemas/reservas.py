from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class ReservaBase(BaseModel):
    cliente_id: int
    contrato_id: Optional[int] = None
    fecha_evento: date
    hora_inicio: time
    hora_fin: time
    estado: Optional[str] = "pendiente"
    observaciones: Optional[str] = None

class ReservaCreate(ReservaBase):
    pass

class ReservaUpdate(BaseModel):
    contrato_id: Optional[int] = None
    fecha_evento: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = None

class ReservaResponse(ReservaBase):
    id: int

    class Config:
        from_attributes = True  # Pydantic v2
