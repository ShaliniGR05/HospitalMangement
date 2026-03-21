from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PrescribedMedicine(Base):
    __tablename__ = "prescribed_medicines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prescription_id = Column(
        Integer, ForeignKey("prescriptions.prescription_id"), nullable=False
    )
    medicine_id = Column(Integer, ForeignKey("medicines.medicine_id"), nullable=False)
    dosage = Column(String)
    duration = Column(String)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)

    prescription = relationship("Prescription", backref="prescribed_medicines", lazy="selectin")
    medicine = relationship("Medicine", backref="prescribed_medicines", lazy="selectin")
