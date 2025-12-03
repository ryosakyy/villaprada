from sqlalchemy.orm import Session
from models.paquetes import Paquete
from schemas.paquetes import PaqueteCreate, PaqueteUpdate

class PaqueteService:

    @staticmethod
    def crear_paquete(data: PaqueteCreate, db: Session):
        nuevo = Paquete(
            nombre=data.nombre,
            descripcion=data.descripcion,
            precio=data.precio,
            capacidad=data.capacidad,
            servicios=data.servicios,
            imagen=data.imagen,
            estado=data.estado
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo

    @staticmethod
    def listar_paquetes(db: Session):
        return db.query(Paquete).all()

    @staticmethod
    def obtener_paquete(id: int, db: Session):
        return db.query(Paquete).filter(Paquete.id == id).first()

    @staticmethod
    def actualizar_paquete(id: int, data: PaqueteUpdate, db: Session):
        paquete = db.query(Paquete).filter(Paquete.id == id).first()
        if not paquete:
            return None

        for campo, valor in data.dict(exclude_unset=True).items():
            setattr(paquete, campo, valor)

        db.commit()
        db.refresh(paquete)
        return paquete

    @staticmethod
    def eliminar_paquete(id: int, db: Session):
        paquete = db.query(Paquete).filter(Paquete.id == id).first()
        if not paquete:
            return None

        db.delete(paquete)
        db.commit()
        return True
