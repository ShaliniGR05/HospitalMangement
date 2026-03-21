from sqlalchemy import Column, Integer, String, Date
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_name = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    phone_num = Column(String, nullable=False)
    address = Column(String)
    blood_group = Column(String)
    registration_date = Column(Date, nullable=False)
