from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import Base, engine

# Routers
from routers import (
    auth, clientes, contratos, reservas, paquetes, pagos,
    egresos, disponibilidad, galeria, dashboard, reportes, usuarios
)

# IMPORTAR MODELOS (asegura creación de tablas)
from models import (
    usuarios as usuarios_model,
    clientes as clientes_model,
    contratos as contratos_model,
    reservas as reservas_model,
    paquetes as paquetes_model,
    pagos as pagos_model,
    egresos as egresos_model,
    disponibilidad as disponibilidad_model,
    galeria as galeria_model
)

# =============================================================
# APP FASTAPI
# =============================================================
app = FastAPI(
    title="Sistema Villa Prada",
    version="1.0.0",
    description="API para gestión de eventos, contratos y finanzas"
)

# =============================================================
# CREAR TABLAS
# =============================================================
Base.metadata.create_all(bind=engine)

# =============================================================
# CORS
# =============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # Cambiar en producción
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

# =============================================================
# REGISTRO DE ROUTERS
# =============================================================
app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(contratos.router)
app.include_router(reservas.router)
app.include_router(paquetes.router)
app.include_router(pagos.router)
app.include_router(egresos.router)
app.include_router(disponibilidad.router)
app.include_router(galeria.router)
app.include_router(dashboard.router)
app.include_router(reportes.router)
app.include_router(usuarios.router)


@app.get("/")
def root():
    return {"message": "API funcionando"}

from fastapi.middleware.cors import CORSMiddleware

