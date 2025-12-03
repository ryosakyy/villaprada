from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.reservas import Reserva
from schemas.reservas import ReservaCreate, ReservaUpdate
from services.disponibilidad_service import DisponibilidadService


class ReservaService:

    @staticmethod
    def crear_reserva(data: ReservaCreate, db: Session):

        # 🔍 Verificar disponibilidad antes de crear
        disponible = DisponibilidadService.verificar_fecha(data.fecha_evento, db)
        if disponible:
            raise HTTPException(
                status_code=400,
                detail=f"La fecha {data.fecha_evento} ya está ocupada ({disponible.estado})"
            )

        reserva = Reserva(
            cliente_id=data.cliente_id,
            contrato_id=data.contrato_id,
            fecha_evento=data.fecha_evento,
            hora_inicio=data.hora_inicio,
            hora_fin=data.hora_fin,
            estado=data.estado,
            observaciones=data.observaciones
        )

        db.add(reserva)
        db.commit()
        db.refresh(reserva)

        # Registrar ocupación
        DisponibilidadService.registrar_ocupado(
            fecha=data.fecha_evento,
            motivo=f"Reserva ID {reserva.id}",
            db=db
        )

        return reserva

    @staticmethod
    def listar_reservas(db: Session):
        return db.query(Reserva).all()

    @staticmethod
    def obtener_reserva(id: int, db: Session):
        return db.query(Reserva).filter(Reserva.id == id).first()

    @staticmethod
    def actualizar_reserva(id: int, data: ReservaUpdate, db: Session):
        reserva = db.query(Reserva).filter(Reserva.id == id).first()
        if not reserva:
            return None

        fecha_original = reserva.fecha_evento
        nueva_fecha = data.fecha_evento

        # Si la fecha NO cambia, actualizar normal
        if not nueva_fecha or nueva_fecha == fecha_original:
            for campo, valor in data.dict(exclude_unset=True).items():
                setattr(reserva, campo, valor)
            db.commit()
            db.refresh(reserva)
            return reserva

        # Si la fecha cambia → validar disponibilidad
        disponible = DisponibilidadService.verificar_fecha(nueva_fecha, db)
        if disponible:
            raise HTTPException(
                status_code=400,
                detail=f"No se puede cambiar. La fecha {nueva_fecha} está ocupada."
            )

        # Liberar fecha antigua
        DisponibilidadService.liberar_fecha(fecha_original, db)

        # Registrar nueva fecha como ocupada
        DisponibilidadService.registrar_ocupado(
            fecha=nueva_fecha,
            motivo=f"Reserva ID {reserva.id}",
            db=db
        )

        # Actualizar reserva
        for campo, valor in data.dict(exclude_unset=True).items():
            setattr(reserva, campo, valor)

        db.commit()
        db.refresh(reserva)
        return reserva

    @staticmethod
    def eliminar_reserva(id: int, db: Session):
        reserva = db.query(Reserva).filter(Reserva.id == id).first()
        if not reserva:
            return None

        # Liberar fecha ocupada
        DisponibilidadService.liberar_fecha(reserva.fecha_evento, db)

        db.delete(reserva)
        db.commit()
        return True
