# backend/routers/clientes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user
from services.clientes_service import ClienteService
from schemas.clientes import ClienteCreate, ClienteUpdate, ClienteResponse

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

# ================================================================
# CREAR CLIENTE (PROTEGIDO)
# ================================================================
@router.post("/", response_model=ClienteResponse, dependencies=[Depends(get_current_user)])
def crear_cliente(data: ClienteCreate, db: Session = Depends(get_db)):
    return ClienteService.crear_cliente(data, db)

# ================================================================
# LISTAR CLIENTES (PROTEGIDO)
# ================================================================
@router.get("/", response_model=List[ClienteResponse], dependencies=[Depends(get_current_user)])
def listar_clientes(db: Session = Depends(get_db)):
    return ClienteService.listar_clientes(db)

# ================================================================
# OBTENER CLIENTE (PROTEGIDO)
# ================================================================
@router.get("/{id}", response_model=ClienteResponse, dependencies=[Depends(get_current_user)])
def obtener_cliente(id: int, db: Session = Depends(get_db)):
    cliente = ClienteService.obtener_cliente(id, db)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

# ================================================================
# ACTUALIZAR CLIENTE (PROTEGIDO)
# ================================================================
@router.put("/{id}", response_model=ClienteResponse, dependencies=[Depends(get_current_user)])
def actualizar_cliente(id: int, data: ClienteUpdate, db: Session = Depends(get_db)):
    cliente = ClienteService.actualizar_cliente(id, data, db)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

# ================================================================
# ELIMINAR CLIENTE (PROTEGIDO)
# ================================================================
@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def eliminar_cliente(id: int, db: Session = Depends(get_db)):
    eliminado = ClienteService.eliminar_cliente(id, db)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"mensaje": f"Cliente con ID {id} eliminado correctamente"}
