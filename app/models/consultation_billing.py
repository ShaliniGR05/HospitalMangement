from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ConsultationBilling(Base):
    __tablename__ = "consultation_billing"

    consultation_bill_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    appointment_id = Column(
        Integer, ForeignKey("appointments.appointment_id"), nullable=False, unique=True
    )
    amount = Column(Float, nullable=False)
    payment_status = Column(String, default="pending")  # pending / completed / cancelled
    payment_date = Column(Date)

    appointment = relationship("Appointment", backref="consultation_bill", lazy="selectin")
