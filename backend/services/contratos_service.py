from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.contratos import Contrato
from schemas.contratos import ContratoCreate, ContratoUpdate
from services.disponibilidad_service import DisponibilidadService


class ContratoService:

    @staticmethod
    def crear_contrato(data: ContratoCreate, db: Session):

        # Validar disponibilidad
        disponible = DisponibilidadService.verificar_fecha(data.fecha_evento, db)
        if disponible:
            raise HTTPException(
                status_code=400,
                detail=f"La fecha {data.fecha_evento} ya está ocupada ({disponible.estado})"
            )

        contrato = Contrato(
            cliente_id=data.cliente_id,
            fecha_evento=data.fecha_evento,
            hora_inicio=data.hora_inicio,
            hora_fin=data.hora_fin,
            paquete=data.paquete,
            monto_total=data.monto_total,
            adelanto=data.adelanto,
            saldo=data.monto_total - data.adelanto,
            estado=data.estado
        )

        db.add(contrato)
        db.commit()
        db.refresh(contrato)

        # Registrar fecha como ocupada
        DisponibilidadService.registrar_ocupado(
            fecha=data.fecha_evento,
            motivo=f"Contrato ID {contrato.id}",
            db=db
        )

        return contrato

    @staticmethod
    def listar_contratos(db: Session):
        return db.query(Contrato).all()

    @staticmethod
    def obtener_contrato(id: int, db: Session):
        return db.query(Contrato).filter(Contrato.id == id).first()

    @staticmethod
    def actualizar_contrato(id: int, data: ContratoUpdate, db: Session):
        contrato = db.query(Contrato).filter(Contrato.id == id).first()
        if not contrato:
            return None

        fecha_original = contrato.fecha_evento
        nueva_fecha = data.fecha_evento

        # Si no cambia fecha → actualizar normal
        if not nueva_fecha or nueva_fecha == fecha_original:
            for campo, valor in data.dict(exclude_unset=True).items():
                setattr(contrato, campo, valor)
            db.commit()
            db.refresh(contrato)
            return contrato

        # Si cambia → validar
        disponible = DisponibilidadService.verificar_fecha(nueva_fecha, db)
        if disponible:
            raise HTTPException(
                status_code=400,
                detail=f"No se puede cambiar. La fecha {nueva_fecha} está ocupada."
            )

        # Liberar la fecha original
        DisponibilidadService.liberar_fecha(fecha_original, db)

        # Registrar nueva fecha
        DisponibilidadService.registrar_ocupado(
            fecha=nueva_fecha,
            motivo=f"Contrato ID {contrato.id}",
            db=db
        )

        # Actualizar datos
        for campo, valor in data.dict(exclude_unset=True).items():
            setattr(contrato, campo, valor)

        db.commit()
        db.refresh(contrato)
        return contrato

    @staticmethod
    def eliminar_contrato(id: int, db: Session):
        contrato = db.query(Contrato).filter(Contrato.id == id).first()
        if not contrato:
            return None

        # Liberar fecha
        DisponibilidadService.liberar_fecha(contrato.fecha_evento, db)

        db.delete(contrato)
        db.commit()
        return True
