# backend/services/usuario_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.usuarios import Usuario
from schemas.usuarios import UsuarioCreate, UsuarioUpdate
from core.security import hash_password, verify_password


class UsuarioService:

    modelo = Usuario

    # =====================================================
    # Crear Usuario
    # =====================================================
    @staticmethod
    def crear_usuario(db: Session, data: UsuarioCreate):
        existe = db.query(Usuario).filter(Usuario.email == data.email).first()
        if existe:
            raise HTTPException(status_code=400, detail="El email ya está registrado")

        nuevo = Usuario(
            nombres=data.nombres,
            email=data.email,
            password_hash=hash_password(data.password),
            rol=data.rol,
            estado=True,
        )

        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo

    # =====================================================
    # Listar Usuarios
    # =====================================================
    @staticmethod
    def listar_usuarios(db: Session):
        return db.query(Usuario).order_by(Usuario.fecha_creacion.desc()).all()

    # =====================================================
    # Obtener por ID
    # =====================================================
    @staticmethod
    def obtener_por_id(db: Session, id: int):
        return db.query(Usuario).filter(Usuario.id == id).first()

    # =====================================================
    # Actualizar Usuario
    # =====================================================
    @staticmethod
    def actualizar_usuario(db: Session, id: int, data: UsuarioUpdate):

        usuario = UsuarioService.obtener_por_id(db, id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        datos = data.dict(exclude_unset=True)

        # Si viene password, la convertimos a password_hash
        if "password" in datos:
            datos["password_hash"] = hash_password(datos["password"])
            del datos["password"]

        for campo, valor in datos.items():
            setattr(usuario, campo, valor)

        db.commit()
        db.refresh(usuario)
        return usuario

    # =====================================================
    # Eliminar usuario (borrado lógico)
    # =====================================================
    @staticmethod
    def eliminar_usuario(db: Session, id: int):
        usuario = UsuarioService.obtener_por_id(db, id)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        usuario.estado = False
        db.commit()

        return {"mensaje": "Usuario desactivado correctamente"}

    # =====================================================
    # Autenticación
    # =====================================================
    @staticmethod
    def autenticar(db: Session, email: str, password: str):

        usuario = db.query(Usuario).filter(Usuario.email == email).first()

        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        if not usuario.estado:
            raise HTTPException(status_code=403, detail="Usuario desactivado")

        if not verify_password(password, usuario.password_hash):
            raise HTTPException(status_code=400, detail="Contraseña incorrecta")

        return usuario
