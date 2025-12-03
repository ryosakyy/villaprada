# backend/routers/paquetes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user
from services.paquetes_service import PaqueteService
from schemas.paquetes import PaqueteCreate, PaqueteUpdate, PaqueteResponse

router = APIRouter(
    prefix="/paquetes",
    tags=["Paquetes"]
)

# ============================================================
# CREAR PAQUETE (PROTEGIDO)
# ============================================================
@router.post("/", response_model=PaqueteResponse, dependencies=[Depends(get_current_user)])
def crear_paquete(data: PaqueteCreate, db: Session = Depends(get_db)):
    return PaqueteService.crear_paquete(data, db)

# ============================================================
# LISTAR PAQUETES (PROTEGIDO)
# ============================================================
@router.get("/", response_model=List[PaqueteResponse], dependencies=[Depends(get_current_user)])
def listar_paquetes(db: Session = Depends(get_db)):
    return PaqueteService.listar_paquetes(db)

# ============================================================
# OBTENER PAQUETE (PROTEGIDO)
# ============================================================
@router.get("/{id}", response_model=PaqueteResponse, dependencies=[Depends(get_current_user)])
def obtener_paquete(id: int, db: Session = Depends(get_db)):
    paquete = PaqueteService.obtener_paquete(id, db)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    return paquete

# ============================================================
# ACTUALIZAR PAQUETE (PROTEGIDO)
# ============================================================
@router.put("/{id}", response_model=PaqueteResponse, dependencies=[Depends(get_current_user)])
def actualizar_paquete(id: int, data: PaqueteUpdate, db: Session = Depends(get_db)):
    paquete = PaqueteService.actualizar_paquete(id, data, db)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    return paquete

# ============================================================
# ELIMINAR PAQUETE (PROTEGIDO)
# ============================================================
@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def eliminar_paquete(id: int, db: Session = Depends(get_db)):
    eliminado = PaqueteService.eliminar_paquete(id, db)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    return {"mensaje": "Paquete eliminado correctamente"}
