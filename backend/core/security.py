# backend/core/security.py

from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext

from core.config import settings

# ---------- Configuración bcrypt ----------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------- Configuración JWT ----------
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Middleware de seguridad para rutas protegidas
oauth2_scheme = HTTPBearer()


# ================== CONTRASEÑAS ==================

def hash_password(password: str) -> str:
    """Encripta una contraseña usando bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con su hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ================== TOKENS JWT ==================

def create_access_token(data: dict, expires_delta: Optional[int] = None) -> str:
    """
    Crea un token JWT con los datos enviados.
    Ejemplo de data:
    {"sub": 1, "email": "admin@x.com"}
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=expires_delta if expires_delta else ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Valida un token JWT y retorna el payload si es válido."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ================== DEPENDENCIA PARA RUTAS PROTEGIDAS ==================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    """
    Extrae el token del header Authorization: Bearer <token>
    y verifica su validez.
    """
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload
