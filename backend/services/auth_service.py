# backend/services/auth_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from core.security import hash_password, verify_password, create_access_token
from models.usuarios import Usuario


class AuthService:

    # -------------------------------------------------------
    # CREAR USUARIO ADMIN
    # -------------------------------------------------------
    @staticmethod
    def crear_admin(nombre: str, correo: str, password: str, db: Session):
        # Verificar si existe el correo
        user_exist = db.query(Usuario).filter(Usuario.correo == correo).first()
        if user_exist:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya está registrado"
            )

        # Crear usuario
        nuevo_usuario = Usuario(
            nombre=nombre,
            correo=correo,
            password=hash_password(password),  # Encriptar
            rol="admin",
            activo=True
        )

        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)

        return {"mensaje": "Administrador creado correctamente", "usuario_id": nuevo_usuario.id}

    # -------------------------------------------------------
    # LOGIN
    # -------------------------------------------------------
    @staticmethod
    def login(correo: str, password: str, db: Session):
        # Buscar usuario
        usuario = db.query(Usuario).filter(Usuario.correo == correo).first()

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El correo no existe"
            )

        if not verify_password(password, usuario.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña incorrecta"
            )

        if not usuario.activo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario está inactivo"
            )

        # Crear TOKEN JWT
        token = create_access_token({
            "sub": str(usuario.id),
            "correo": usuario.correo,
            "rol": usuario.rol
        })

        return {
            "mensaje": "Login exitoso",
            "access_token": token,
            "token_type": "bearer"
        }

    # -------------------------------------------------------
    # OBTENER PERFIL DEL USUARIO ACTUAL
    # -------------------------------------------------------
    @staticmethod
    def obtener_perfil(usuario_id: int, db: Session):
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        return {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "correo": usuario.correo,
            "rol": usuario.rol,
            "activo": usuario.activo,
            "fecha_creacion": usuario.fecha_creacion
        }
