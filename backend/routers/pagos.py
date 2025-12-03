# backend/routers/pagos.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user
from services.pagos_service import PagoService
from schemas.pagos import PagoCreate, PagoUpdate, PagoResponse, PagoResumen

router = APIRouter(
    prefix="/pagos",
    tags=["Pagos"]
)

# ============================================================
# CREAR PAGO (PROTEGIDO)
# ============================================================
@router.post("/", response_model=PagoResponse, dependencies=[Depends(get_current_user)])
def crear_pago(data: PagoCreate, db: Session = Depends(get_db)):
    try:
        return PagoService.crear_pago(data, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================
# LISTAR PAGOS (PROTEGIDO)
# ============================================================
@router.get("/", response_model=List[PagoResponse], dependencies=[Depends(get_current_user)])
def listar_pagos(db: Session = Depends(get_db)):
    return PagoService.listar_pagos(db)


# ============================================================
# OBTENER PAGO (PROTEGIDO)
# ============================================================
@router.get("/{id}", response_model=PagoResponse, dependencies=[Depends(get_current_user)])
def obtener_pago(id: int, db: Session = Depends(get_db)):
    pago = PagoService.obtener_pago(id, db)
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return pago


# ============================================================
# PAGOS POR CONTRATO (PROTEGIDO)
# ============================================================
@router.get("/contrato/{contrato_id}", response_model=List[PagoResponse], dependencies=[Depends(get_current_user)])
def pagos_por_contrato(contrato_id: int, db: Session = Depends(get_db)):
    return PagoService.listar_pagos_por_contrato(contrato_id, db)


# ============================================================
# ACTUALIZAR PAGO (PROTEGIDO)
# ============================================================
@router.put("/{id}", response_model=PagoResponse, dependencies=[Depends(get_current_user)])
def actualizar_pago(id: int, data: PagoUpdate, db: Session = Depends(get_db)):
    try:
        pago = PagoService.actualizar_pago(id, data, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return pago


# ============================================================
# ELIMINAR PAGO (PROTEGIDO)
# ============================================================
@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def eliminar_pago(id: int, db: Session = Depends(get_db)):
    eliminado = PagoService.eliminar_pago(id, db)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return {"mensaje": "Pago eliminado correctamente"}


# ============================================================
# RESUMEN DEL CONTRATO (PROTEGIDO)
# ============================================================
@router.get("/resumen/{contrato_id}", response_model=PagoResumen, dependencies=[Depends(get_current_user)])
def resumen_contrato(contrato_id: int, db: Session = Depends(get_db)):
    resumen = PagoService.resumen_contrato(contrato_id, db)
    if not resumen:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return resumen
