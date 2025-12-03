# services/dashboard_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from models.clientes import Cliente
from models.contratos import Contrato
from models.reservas import Reserva
from models.pagos import Pago
from models.egresos import Egreso
from models.disponibilidad import Disponibilidad


class DashboardService:

    # ---------------------------------------------
    # RESUMEN GENERAL (cards de arriba del dashboard)
    # ---------------------------------------------
    @staticmethod
    def resumen_general(db: Session):
        total_clientes = db.query(func.count(Cliente.id)).scalar() or 0
        total_contratos = db.query(func.count(Contrato.id)).scalar() or 0
        total_reservas = db.query(func.count(Reserva.id)).scalar() or 0

        ingresos_totales = (
            db.query(func.coalesce(func.sum(Pago.monto), 0.0)).scalar() or 0.0
        )
        egresos_totales = (
            db.query(func.coalesce(func.sum(Egreso.monto), 0.0)).scalar() or 0.0
        )

        utilidad_total = float(ingresos_totales) - float(egresos_totales)

        return {
            "total_clientes": int(total_clientes),
            "total_contratos": int(total_contratos),
            "total_reservas": int(total_reservas),
            "ingresos_totales": float(ingresos_totales),
            "egresos_totales": float(egresos_totales),
            "utilidad_total": float(utilidad_total),
        }

    # ---------------------------------------------
    # INGRESOS / EGRESOS / UTILIDAD POR MES
    # ---------------------------------------------
    @staticmethod
    def ingresos_mensuales(db: Session, anio: int):
        # Ingresos por mes
        ingresos_q = (
            db.query(
                extract("month", Pago.fecha_pago).label("mes"),
                func.coalesce(func.sum(Pago.monto), 0.0).label("total"),
            )
            .filter(extract("year", Pago.fecha_pago) == anio)
            .group_by("mes")
            .all()
        )
        ingresos_map = {int(row.mes): float(row.total) for row in ingresos_q}

        # Egresos por mes
        egresos_q = (
            db.query(
                extract("month", Egreso.fecha).label("mes"),
                func.coalesce(func.sum(Egreso.monto), 0.0).label("total"),
            )
            .filter(extract("year", Egreso.fecha) == anio)
            .group_by("mes")
            .all()
        )
        egresos_map = {int(row.mes): float(row.total) for row in egresos_q}

        resultado = []
        for mes in range(1, 13):
            ing = ingresos_map.get(mes, 0.0)
            egr = egresos_map.get(mes, 0.0)
            utilidad = ing - egr
            resultado.append(
                {
                    "mes": mes,
                    "ingresos": ing,
                    "egresos": egr,
                    "utilidad": utilidad,
                }
            )

        return resultado

    # ---------------------------------------------
    # OCUPACIÓN DEL LOCAL POR MES
    # ---------------------------------------------
    @staticmethod
    def ocupacion_mensual(db: Session, anio: int):
        # Contratos por mes
        contratos_q = (
            db.query(
                extract("month", Contrato.fecha_evento).label("mes"),
                func.count(Contrato.id).label("total"),
            )
            .filter(extract("year", Contrato.fecha_evento) == anio)
            .group_by("mes")
            .all()
        )
        contratos_map = {int(row.mes): int(row.total) for row in contratos_q}

        # Reservas por mes
        reservas_q = (
            db.query(
                extract("month", Reserva.fecha_evento).label("mes"),
                func.count(Reserva.id).label("total"),
            )
            .filter(extract("year", Reserva.fecha_evento) == anio)
            .group_by("mes")
            .all()
        )
        reservas_map = {int(row.mes): int(row.total) for row in reservas_q}

        resultado = []
        for mes in range(1, 13):
            c = contratos_map.get(mes, 0)
            r = reservas_map.get(mes, 0)
            total = c + r
            resultado.append(
                {
                    "mes": mes,
                    "contratos": c,
                    "reservas": r,
                    "total_eventos": total,
                }
            )

        return resultado

    # ---------------------------------------------
    # TOP PAQUETES (por campo texto Contrato.paquete)
    # ---------------------------------------------
    @staticmethod
    def top_paquetes(db: Session, limite: int = 5):
        # Contamos por el campo string "paquete" del contrato
        filas = (
            db.query(
                Contrato.paquete,
                func.count(Contrato.id).label("total"),
            )
            .filter(Contrato.paquete.isnot(None))
            .group_by(Contrato.paquete)
            .order_by(func.count(Contrato.id).desc())
            .limit(limite)
            .all()
        )

        return [
            {"paquete": fila.paquete, "total": int(fila.total)}
            for fila in filas
        ]

    # ---------------------------------------------
    # FECHAS OCUPADAS / BLOQUEADAS POR MES
    # ---------------------------------------------
    @staticmethod
    def fechas_ocupadas(db: Session, anio: int, mes: int):
        filas = (
            db.query(Disponibilidad)
            .filter(extract("year", Disponibilidad.fecha) == anio)
            .filter(extract("month", Disponibilidad.fecha) == mes)
            .filter(Disponibilidad.estado.in_(["ocupado", "bloqueado"]))
            .order_by(Disponibilidad.fecha.asc())
            .all()
        )

        return [
            {
                "fecha": fila.fecha,
                "estado": fila.estado,
                "motivo": fila.motivo,
            }
            for fila in filas
        ]
