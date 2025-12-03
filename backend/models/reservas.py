from sqlalchemy import Column, Integer, Date, Time, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    contrato_id = Column(Integer, ForeignKey("contratos.id"), nullable=True)

    fecha_evento = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)

    estado = Column(String(20), default="pendiente")
    observaciones = Column(String(255), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.now)

    cliente = relationship("Cliente")
    contrato = relationship("Contrato")
