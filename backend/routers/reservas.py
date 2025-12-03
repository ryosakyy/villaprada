# backend/routers/reservas.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user
from services.reservas_service import ReservaService
from schemas.reservas import ReservaCreate, ReservaUpdate, ReservaResponse

from models.disponibilidad import Disponibilidad

router = APIRouter(
    prefix="/reservas",
    tags=["Reservas"]
)

# ============================================================
# CREAR RESERVA (PROTEGIDO)
# ============================================================
@router.post("/", response_model=ReservaResponse, dependencies=[Depends(get_current_user)])
def crear_reserva(data: ReservaCreate, db: Session = Depends(get_db)):

    nueva_reserva = ReservaService.crear_reserva(data, db)

    # Registrar fecha ocupada
    ocupado = Disponibilidad(
        fecha=nueva_reserva.fecha_evento,
        estado="ocupado",
        motivo=f"Reserva ID {nueva_reserva.id}"
    )

    db.add(ocupado)
    db.commit()

    return nueva_reserva

# ============================================================
# LISTAR RESERVAS (PROTEGIDO)
# ============================================================
@router.get("/", response_model=List[ReservaResponse], dependencies=[Depends(get_current_user)])
def listar_reservas(db: Session = Depends(get_db)):
    return ReservaService.listar_reservas(db)

# ============================================================
# OBTENER RESERVA (PROTEGIDO)
# ============================================================
@router.get("/{id}", response_model=ReservaResponse, dependencies=[Depends(get_current_user)])
def obtener_reserva(id: int, db: Session = Depends(get_db)):
    reserva = ReservaService.obtener_reserva(id, db)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva

# ============================================================
# ACTUALIZAR RESERVA (PROTEGIDO)
# ============================================================
@router.put("/{id}", response_model=ReservaResponse, dependencies=[Depends(get_current_user)])
def actualizar_reserva(id: int, data: ReservaUpdate, db: Session = Depends(get_db)):
    reserva = ReservaService.actualizar_reserva(id, data, db)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva

# ============================================================
# ELIMINAR RESERVA (PROTEGIDO)
# ============================================================
@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def eliminar_reserva(id: int, db: Session = Depends(get_db)):
    eliminado = ReservaService.eliminar_reserva(id, db)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return {"mensaje": "Reserva eliminada correctamente"}
