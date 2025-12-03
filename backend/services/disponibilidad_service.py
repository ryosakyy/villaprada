from sqlalchemy.orm import Session
from models.disponibilidad import Disponibilidad


class DisponibilidadService:

    @staticmethod
    def verificar_fecha(fecha, db: Session):
        return db.query(Disponibilidad).filter(
            Disponibilidad.fecha == fecha
        ).first()

    @staticmethod
    def registrar_ocupado(fecha, motivo, db: Session):
        ocupado = Disponibilidad(
            fecha=fecha,
            estado="ocupado",
            motivo=motivo
        )
        db.add(ocupado)
        db.commit()
        db.refresh(ocupado)
        return ocupado

    @staticmethod
    def registrar_bloqueado(fecha, motivo, db: Session):
        bloqueado = Disponibilidad(
            fecha=fecha,
            estado="bloqueado",
            motivo=motivo
        )
        db.add(bloqueado)
        db.commit()
        db.refresh(bloqueado)
        return bloqueado

    @staticmethod
    def liberar_fecha(fecha: str, db: Session):
        registro = db.query(Disponibilidad).filter(
            Disponibilidad.fecha == fecha
        ).first()
        if registro:
            db.delete(registro)
            db.commit()
            return True
        return False
