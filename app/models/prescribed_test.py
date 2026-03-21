from sqlalchemy import Column, Integer, String, Float, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PrescribedTest(Base):
    __tablename__ = "prescribed_tests"

    prescribed_test_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=False)
    test_id = Column(Integer, ForeignKey("lab_tests.test_id"), nullable=False)
    prescribed_date = Column(Date, nullable=False)
    result_date = Column(Date)
    result_time = Column(Time)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending / completed / cancelled

    appointment = relationship("Appointment", backref="prescribed_tests", lazy="selectin")
    lab_test = relationship("LabTest", backref="prescribed_tests", lazy="selectin")
