# backend/schemas/egresos.py

from pydantic import BaseModel
from datetime import date
from typing import Optional

class EgresoBase(BaseModel):
    descripcion: str
    monto: float
    categoria: str
    fecha: date
    observacion: Optional[str] = None
    contrato_id: Optional[int] = None

class EgresoCreate(EgresoBase):
    pass

class EgresoUpdate(BaseModel):
    descripcion: Optional[str] = None
    monto: Optional[float] = None
    categoria: Optional[str] = None
    fecha: Optional[date] = None
    observacion: Optional[str] = None
    contrato_id: Optional[int] = None

class EgresoResponse(EgresoBase):
    id: int
    class Config:
        from_attributes = True


# ---------- RESÚMENES FINANCIEROS ----------

class ResumenEgresosContrato(BaseModel):
    contrato_id: int
    total_egresos: float

class ResumenMensual(BaseModel):
    anio: int
    mes: int
    total_egresos: float

class ResumenAnual(BaseModel):
    anio: int
    total_egresos: float

class UtilidadContrato(BaseModel):
    contrato_id: int
    ingresos: float
    egresos: float
    utilidad: float

class UtilidadMensual(BaseModel):
    anio: int
    mes: int
    ingresos: float
    egresos: float
    utilidad: float
