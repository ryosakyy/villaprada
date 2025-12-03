# backend/routers/egresos.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user
from services.egresos_service import EgresoService
from schemas.egresos import (
    EgresoCreate, EgresoUpdate, EgresoResponse,
    ResumenEgresosContrato, ResumenMensual, ResumenAnual,
    UtilidadContrato, UtilidadMensual
)

router = APIRouter(
    prefix="/egresos",
    tags=["Egresos"]
)

# ============================================================
# CRUD – TODOS PROTEGIDOS
# ============================================================

@router.post("/", response_model=EgresoResponse, dependencies=[Depends(get_current_user)])
def crear(data: EgresoCreate, db: Session = Depends(get_db)):
    return EgresoService.crear(data, db)


@router.get("/", response_model=List[EgresoResponse], dependencies=[Depends(get_current_user)])
def listar(db: Session = Depends(get_db)):
    return EgresoService.listar(db)


@router.get("/{id}", response_model=EgresoResponse, dependencies=[Depends(get_current_user)])
def obtener(id: int, db: Session = Depends(get_db)):
    eg = EgresoService.obtener(id, db)
    if not eg:
        raise HTTPException(status_code=404, detail="Egreso no encontrado")
    return eg


@router.put("/{id}", response_model=EgresoResponse, dependencies=[Depends(get_current_user)])
def actualizar(id: int, data: EgresoUpdate, db: Session = Depends(get_db)):
    eg = EgresoService.actualizar(id, data, db)
    if not eg:
        raise HTTPException(status_code=404, detail="Egreso no encontrado")
    return eg


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def eliminar(id: int, db: Session = Depends(get_db)):
    elim = EgresoService.eliminar(id, db)
    if not elim:
        raise HTTPException(status_code=404, detail="Egreso no encontrado")
    return {"mensaje": "Egreso eliminado correctamente"}


# ============================================================
# RESÚMENES – TODOS PROTEGIDOS
# ============================================================

@router.get("/resumen/contrato/{contrato_id}", response_model=ResumenEgresosContrato, dependencies=[Depends(get_current_user)])
def resumen_contrato(contrato_id: int, db: Session = Depends(get_db)):
    return EgresoService.resumen_contrato(contrato_id, db)


@router.get("/resumen/mensual/{anio}/{mes}", response_model=ResumenMensual, dependencies=[Depends(get_current_user)])
def resumen_mensual(anio: int, mes: int, db: Session = Depends(get_db)):
    return EgresoService.resumen_mensual(anio, mes, db)


@router.get("/resumen/anual/{anio}", response_model=ResumenAnual, dependencies=[Depends(get_current_user)])
def resumen_anual(anio: int, db: Session = Depends(get_db)):
    return EgresoService.resumen_anual(anio, db)


# ============================================================
# UTILIDAD – TODOS PROTEGIDOS
# ============================================================

@router.get("/utilidad/contrato/{contrato_id}", response_model=UtilidadContrato, dependencies=[Depends(get_current_user)])
def utilidad_contrato(contrato_id: int, db: Session = Depends(get_db)):
    u = EgresoService.utilidad_contrato(contrato_id, db)
    if not u:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return u


@router.get("/utilidad/mensual/{anio}/{mes}", response_model=UtilidadMensual, dependencies=[Depends(get_current_user)])
def utilidad_mensual(anio: int, mes: int, db: Session = Depends(get_db)):
    return EgresoService.utilidad_mensual(anio, mes, db)
