# backend/routers/contratos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user
from services.contratos_service import ContratoService
from schemas.contratos import ContratoCreate, ContratoUpdate, ContratoResponse
from models.disponibilidad import Disponibilidad

router = APIRouter(
    prefix="/contratos",
    tags=["Contratos"]
)

# ============================================================
# CREAR CONTRATO (PROTEGIDO)
# ============================================================
@router.post("/", response_model=ContratoResponse, dependencies=[Depends(get_current_user)])
def crear_contrato(data: ContratoCreate, db: Session = Depends(get_db)):

    # Crear contrato
    nuevo_contrato = ContratoService.crear_contrato(data, db)

    # Registrar fecha ocupada
    ocupado = Disponibilidad(
        fecha=nuevo_contrato.fecha_evento,
        estado="ocupado",
        motivo=f"Contrato ID {nuevo_contrato.id}"
    )

    db.add(ocupado)
    db.commit()

    return nuevo_contrato


# ============================================================
# LISTAR CONTRATOS (PROTEGIDO)
# ============================================================
@router.get("/", response_model=List[ContratoResponse], dependencies=[Depends(get_current_user)])
def listar_contratos(db: Session = Depends(get_db)):
    return ContratoService.listar_contratos(db)


# ============================================================
# OBTENER CONTRATO POR ID (PROTEGIDO)
# ============================================================
@router.get("/{id}", response_model=ContratoResponse, dependencies=[Depends(get_current_user)])
def obtener_contrato(id: int, db: Session = Depends(get_db)):
    contrato = ContratoService.obtener_contrato(id, db)
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contrato


# ============================================================
# ACTUALIZAR CONTRATO (PROTEGIDO)
# ============================================================
@router.put("/{id}", response_model=ContratoResponse, dependencies=[Depends(get_current_user)])
def actualizar_contrato(id: int, data: ContratoUpdate, db: Session = Depends(get_db)):
    contrato = ContratoService.actualizar_contrato(id, data, db)
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contrato


# ============================================================
# ELIMINAR CONTRATO (PROTEGIDO)
# ============================================================
@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def eliminar_contrato(id: int, db: Session = Depends(get_db)):

    eliminado = ContratoService.eliminar_contrato(id, db)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")

    # También eliminar la disponibilidad asociada
    db.query(Disponibilidad).filter(
        Disponibilidad.motivo == f"Contrato ID {id}"
    ).delete()
    db.commit()

    return {"mensaje": "Contrato eliminado correctamente"}
