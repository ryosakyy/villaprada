# backend/routers/dashboard.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from calendar import monthrange
from sqlalchemy import func

from core.database import get_db
from core.security import get_current_user
from models.clientes import Cliente
from models.contratos import Contrato
from models.reservas import Reserva
from models.pagos import Pago
from models.egresos import Egreso

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

# ============================================================
# 1️⃣ RESUMEN GENERAL - lo que pide tu frontend: /dashboard/totales
# ============================================================
@router.get("/totales", dependencies=[Depends(get_current_user)])
def dashboard_totales(db: Session = Depends(get_db)):

    total_clientes = db.query(Cliente).count()
    total_contratos = db.query(Contrato).count()
    total_reservas = db.query(Reserva).count()

    ingresos_totales = db.query(func.sum(Pago.monto)).scalar() or 0
    egresos_totales = db.query(func.sum(Egreso.monto)).scalar() or 0

    utilidad = ingresos_totales - egresos_totales

    # ==================== Reservas por día del mes actual ====================
    hoy = date.today()
    ultimo_dia = monthrange(hoy.year, hoy.month)[1]

    reservas_dias = []
    for dia in range(1, ultimo_dia + 1):
        fecha = date(hoy.year, hoy.month, dia)
        cantidad = db.query(Reserva).filter(Reserva.fecha_evento == fecha).count()

        reservas_dias.append({
            "dia": dia,
            "cantidad": cantidad
        })

    # ==================== Finanzas globales ====================
    finanzas = {
        "ingresos": ingresos_totales,
        "egresos": egresos_totales,
        "utilidad": utilidad
    }

    return {
        "total_clientes": total_clientes,
        "total_contratos": total_contratos,
        "total_reservas": total_reservas,
        "ingresos_totales": ingresos_totales,
        "egresos_totales": egresos_totales,
        "utilidad_total": utilidad,
        "reservas_dias": reservas_dias,
        "finanzas": finanzas
    }


# ============================================================
# 2️⃣ INGRESOS MENSUALES
# ============================================================
@router.get("/ingresos-mensuales", dependencies=[Depends(get_current_user)])
def ingresos_mensuales(anio: int, db: Session = Depends(get_db)):

    resultados = []

    for mes in range(1, 13):
        total_mes = (
            db.query(func.sum(Pago.monto))
            .filter(func.extract("year", Pago.fecha_pago) == anio)
            .filter(func.extract("month", Pago.fecha_pago) == mes)
            .scalar() or 0
        )
        resultados.append({
            "mes": mes,
            "ingresos": total_mes
        })

    return {
        "anio": anio,
        "datos": resultados
    }


# ============================================================
# 3️⃣ OCUPACIÓN MENSUAL
# ============================================================
@router.get("/ocupacion-mensual", dependencies=[Depends(get_current_user)])
def ocupacion_mensual(anio: int, mes: int, db: Session = Depends(get_db)):

    if mes < 1 or mes > 12:
        raise HTTPException(status_code=400, detail="Mes inválido")

    ultimo = monthrange(anio, mes)[1]
    dias = []

    for dia in range(1, ultimo + 1):
        fecha = date(anio, mes, dia)

        eventos = (
            db.query(Contrato).filter(Contrato.fecha_evento == fecha).count()
            +
            db.query(Reserva).filter(Reserva.fecha_evento == fecha).count()
        )

        dias.append({"dia": dia, "eventos": eventos})

    return {"anio": anio, "mes": mes, "ocupacion": dias}


# ============================================================
# 4️⃣ TOP PAQUETES
# ============================================================
@router.get("/top-paquetes", dependencies=[Depends(get_current_user)])
def top_paquetes(db: Session = Depends(get_db)):

    data = (
        db.query(Contrato.paquete, func.count(Contrato.id).label("cantidad"))
        .group_by(Contrato.paquete)
        .order_by(func.count(Contrato.id).desc())
        .all()
    )

    return [{"paquete": r[0], "cantidad": r[1]} for r in data]


# ============================================================
# 5️⃣ FECHAS OCUPADAS
# ============================================================
@router.get("/fechas-ocupadas", dependencies=[Depends(get_current_user)])
def fechas_ocupadas(anio: int, mes: int, db: Session = Depends(get_db)):

    fechas = set()

    contratos = db.query(Contrato.fecha_evento).filter(
        func.extract("year", Contrato.fecha_evento) == anio,
        func.extract("month", Contrato.fecha_evento) == mes
    ).all()

    reservas = db.query(Reserva.fecha_evento).filter(
        func.extract("year", Reserva.fecha_evento) == anio,
        func.extract("month", Reserva.fecha_evento) == mes
    ).all()

    for c in contratos: fechas.add(str(c[0]))
    for r in reservas: fechas.add(str(r[0]))

    return sorted(list(fechas))


# ============================================================
# 6️⃣ ESTADÍSTICAS DETALLADAS DEL MES
# ============================================================
@router.get("/estadisticas-mes", dependencies=[Depends(get_current_user)])
def estadisticas_mes(anio: int, mes: int, db: Session = Depends(get_db)):

    if mes < 1 or mes > 12:
        raise HTTPException(status_code=400, detail="Mes inválido")

    ultimo = monthrange(anio, mes)[1]
    datos = []

    for dia in range(1, ultimo + 1):
        fecha = date(anio, mes, dia)

        reservas_dia = db.query(Reserva).filter(
            Reserva.fecha_evento == fecha
        ).count()

        ingresos = db.query(Pago.monto).filter(
            Pago.fecha_pago == fecha
        ).all()

        total_ingresos = sum([x[0] for x in ingresos]) if ingresos else 0

        egresos = db.query(Egreso.monto).filter(
            Egreso.fecha == fecha
        ).all()

        total_egresos = sum([x[0] for x in egresos]) if egresos else 0

        datos.append({
            "dia": dia,
            "reservas": reservas_dia,
            "ingresos": total_ingresos,
            "egresos": total_egresos,
            "utilidad": total_ingresos - total_egresos
        })

    return {"anio": anio, "mes": mes, "detalle": datos}
