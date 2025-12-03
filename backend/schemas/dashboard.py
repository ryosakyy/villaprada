# schemas/dashboard.py
from pydantic import BaseModel
from datetime import date
from typing import List


class ResumenGeneral(BaseModel):
    total_clientes: int
    total_contratos: int
    total_reservas: int
    ingresos_totales: float
    egresos_totales: float
    utilidad_total: float


class IngresoMensual(BaseModel):
    mes: int          # 1..12
    ingresos: float
    egresos: float
    utilidad: float


class OcupacionMensual(BaseModel):
    mes: int              # 1..12
    contratos: int
    reservas: int
    total_eventos: int


class TopPaquete(BaseModel):
    paquete: str
    total: int


class FechaOcupada(BaseModel):
    fecha: date
    estado: str
    motivo: str
