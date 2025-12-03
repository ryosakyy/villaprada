from sqlalchemy.orm import Session
from models.clientes import Cliente
from schemas.clientes import ClienteCreate, ClienteUpdate

class ClienteService:

    @staticmethod
    def crear_cliente(data: ClienteCreate, db: Session):
        nuevo = Cliente(
            dni=data.dni,
            nombre=data.nombre,
            telefono=data.telefono,
            correo=data.correo,
            direccion=data.direccion
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo

    @staticmethod
    def listar_clientes(db: Session):
        return db.query(Cliente).all()

    @staticmethod
    def obtener_cliente(id: int, db: Session):
        return db.query(Cliente).filter(Cliente.id == id).first()

    @staticmethod
    def actualizar_cliente(id: int, data: ClienteUpdate, db: Session):
        cliente = db.query(Cliente).filter(Cliente.id == id).first()
        if not cliente:
            return None

        for campo, valor in data.dict(exclude_unset=True).items():
            setattr(cliente, campo, valor)

        db.commit()
        db.refresh(cliente)
        return cliente

    @staticmethod
    def eliminar_cliente(id: int, db: Session):
        cliente = db.query(Cliente).filter(Cliente.id == id).first()
        if not cliente:
            return None

        db.delete(cliente)
        db.commit()
        return True
