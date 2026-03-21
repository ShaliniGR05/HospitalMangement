from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    doc_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    staff_id = Column(Integer, ForeignKey("staffs.staff_id"), nullable=False)
    specialization = Column(String, nullable=False)
    qualification = Column(String, nullable=False)
    experience = Column(Integer, default=0)
    no_of_patients = Column(Integer, default=0)

    staff = relationship("Staff", backref="doctor", lazy="selectin")
