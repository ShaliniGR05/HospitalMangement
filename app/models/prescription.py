from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    prescription_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=False)
    prescribed_date = Column(Date, nullable=False)

    appointment = relationship("Appointment", backref="prescriptions", lazy="selectin")
