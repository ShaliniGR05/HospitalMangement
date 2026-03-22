from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import quoted_name

from database import Base


class Department(Base):
    __tablename__ = "department"

    dept_id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String(100), nullable=False)

    staffs = relationship("Staff", back_populates="department")


class User(Base):
    __tablename__ = quoted_name("User", True)

    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctor.doc_id", ondelete="SET NULL"), nullable=True)
    staff_id = Column(Integer, ForeignKey("staff.staff_id", ondelete="SET NULL"), nullable=True)

    doctor_profile = relationship("Doctor", foreign_keys=[doctor_id])
    staff_profile = relationship("Staff", foreign_keys=[staff_id])


class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(Integer, primary_key=True, index=True)
    staff_name = Column(String(100), nullable=False)
    gender = Column(String(10))
    phone = Column(String(15))
    email = Column(String(100))
    address = Column(Text)
    dept_id = Column(Integer, ForeignKey("department.dept_id", ondelete="SET NULL"), nullable=True)
    role = Column(String(50))
    salary = Column(Numeric(10, 2))
    joining_date = Column(Date)
    status = Column(String(20))

    department = relationship("Department", back_populates="staffs")
    doctor_profile = relationship("Doctor", back_populates="staff", uselist=False, cascade="all, delete")


class Doctor(Base):
    __tablename__ = "doctor"

    doc_id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.staff_id", ondelete="CASCADE"), unique=True)
    specialization = Column(String(100))
    qualification = Column(String(100))

    staff = relationship("Staff", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patient"

    patient_id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(100), nullable=False)
    gender = Column(String(10))
    age = Column(Integer)
    phone_num = Column(String(15))
    address = Column(Text)
    blood_group = Column(String(5))
    registration_date = Column(Date)

    appointments = relationship("Appointment", back_populates="patient")


class Appointment(Base):
    __tablename__ = "appointment"

    appointment_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.patient_id", ondelete="CASCADE"))
    doctor_id = Column(Integer, ForeignKey("doctor.doc_id", ondelete="CASCADE"))
    dept_id = Column(Integer, ForeignKey("department.dept_id", ondelete="SET NULL"), nullable=True)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(String(20))

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    department = relationship("Department")
    consultation_billing = relationship(
        "ConsultationBilling", back_populates="appointment", uselist=False, cascade="all, delete"
    )
    prescriptions = relationship("Prescription", back_populates="appointment", cascade="all, delete")
    prescribed_tests = relationship("PrescribedTest", back_populates="appointment", cascade="all, delete")


class ConsultationBilling(Base):
    __tablename__ = "consultation_billing"

    consultation_bill_id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointment.appointment_id", ondelete="CASCADE"), unique=True)
    amount = Column(Numeric(10, 2))
    payment_status = Column(String(20))
    payment_date = Column(Date)

    appointment = relationship("Appointment", back_populates="consultation_billing")


class Prescription(Base):
    __tablename__ = "prescription"

    prescription_id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointment.appointment_id", ondelete="CASCADE"))
    prescribed_date = Column(Date)

    appointment = relationship("Appointment", back_populates="prescriptions")
    prescribed_medicines = relationship("PrescribedMedicine", back_populates="prescription", cascade="all, delete")


class Medicine(Base):
    __tablename__ = "medicine"

    medicine_id = Column(Integer, primary_key=True, index=True)
    medicine_name = Column(String(100), nullable=False)
    unit_price = Column(Numeric(10, 2))

    prescribed_items = relationship("PrescribedMedicine", back_populates="medicine")


class PrescribedMedicine(Base):
    __tablename__ = "prescribed_medicine"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescription.prescription_id", ondelete="CASCADE"))
    medicine_id = Column(Integer, ForeignKey("medicine.medicine_id"))
    dosage = Column(String(50))
    duration = Column(String(50))
    quantity = Column(Integer)
    unit_price = Column(Numeric(10, 2))
    amount = Column(Numeric(10, 2))

    prescription = relationship("Prescription", back_populates="prescribed_medicines")
    medicine = relationship("Medicine", back_populates="prescribed_items")


class LabTest(Base):
    __tablename__ = "lab_test"

    test_id = Column(Integer, primary_key=True, index=True)
    test_name = Column(String(100), nullable=False)
    standard_cost = Column(Numeric(10, 2))

    prescribed_tests = relationship("PrescribedTest", back_populates="test")


class PrescribedTest(Base):
    __tablename__ = "prescribed_test"

    prescribed_test_id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointment.appointment_id", ondelete="CASCADE"))
    test_id = Column(Integer, ForeignKey("lab_test.test_id"))
    prescribed_date = Column(Date)
    result_date = Column(Date)
    result_time = Column(Time)
    amount = Column(Numeric(10, 2))
    status = Column(String(20))

    appointment = relationship("Appointment", back_populates="prescribed_tests")
    test = relationship("LabTest", back_populates="prescribed_tests")
