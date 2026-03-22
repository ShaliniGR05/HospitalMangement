from datetime import date, time

from pydantic import BaseModel, ConfigDict, Field


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str


class LoginRequest(BaseModel):
    user_name: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    user_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=128)
    role: str
    doctor_id: int | None = None
    staff_id: int | None = None


class UserUpdate(BaseModel):
    user_name: str | None = Field(default=None, min_length=1, max_length=100)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    role: str | None = None
    doctor_id: int | None = None
    staff_id: int | None = None


class UserRead(ORMBase):
    user_id: int
    user_name: str
    role: str
    doctor_id: int | None = None
    staff_id: int | None = None


class DepartmentCreate(BaseModel):
    dept_name: str


class DepartmentUpdate(BaseModel):
    dept_name: str | None = None


class DepartmentRead(ORMBase):
    dept_id: int
    dept_name: str


class StaffCreate(BaseModel):
    staff_name: str
    gender: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    dept_id: int | None = None
    role: str | None = None
    salary: float | None = None
    joining_date: date | None = None
    status: str | None = None


class StaffUpdate(BaseModel):
    staff_name: str | None = None
    gender: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    dept_id: int | None = None
    role: str | None = None
    salary: float | None = None
    joining_date: date | None = None
    status: str | None = None


class StaffRead(ORMBase):
    staff_id: int
    staff_name: str
    gender: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    dept_id: int | None = None
    role: str | None = None
    salary: float | None = None
    joining_date: date | None = None
    status: str | None = None


class DoctorCreate(BaseModel):
    staff_id: int
    specialization: str | None = None
    qualification: str | None = None


class DoctorUpdate(BaseModel):
    staff_id: int | None = None
    specialization: str | None = None
    qualification: str | None = None


class DoctorRead(ORMBase):
    doc_id: int
    staff_id: int
    specialization: str | None = None
    qualification: str | None = None


class PatientCreate(BaseModel):
    patient_name: str
    gender: str | None = None
    age: int | None = None
    phone_num: str | None = None
    address: str | None = None
    blood_group: str | None = None
    registration_date: date | None = None


class PatientUpdate(BaseModel):
    patient_name: str | None = None
    gender: str | None = None
    age: int | None = None
    phone_num: str | None = None
    address: str | None = None
    blood_group: str | None = None
    registration_date: date | None = None


class PatientRead(ORMBase):
    patient_id: int
    patient_name: str
    gender: str | None = None
    age: int | None = None
    phone_num: str | None = None
    address: str | None = None
    blood_group: str | None = None
    registration_date: date | None = None


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    dept_id: int | None = None
    appointment_date: date
    appointment_time: time
    status: str | None = None


class AppointmentUpdate(BaseModel):
    patient_id: int | None = None
    doctor_id: int | None = None
    dept_id: int | None = None
    appointment_date: date | None = None
    appointment_time: time | None = None
    status: str | None = None


class AppointmentRead(ORMBase):
    appointment_id: int
    patient_id: int
    doctor_id: int
    dept_id: int | None = None
    appointment_date: date
    appointment_time: time
    status: str | None = None


class ConsultationBillingCreate(BaseModel):
    appointment_id: int
    amount: float | None = None
    payment_status: str | None = None
    payment_date: date | None = None


class ConsultationBillingUpdate(BaseModel):
    appointment_id: int | None = None
    amount: float | None = None
    payment_status: str | None = None
    payment_date: date | None = None


class ConsultationBillingRead(ORMBase):
    consultation_bill_id: int
    appointment_id: int
    amount: float | None = None
    payment_status: str | None = None
    payment_date: date | None = None


class PrescriptionCreate(BaseModel):
    appointment_id: int
    prescribed_date: date | None = None


class PrescriptionUpdate(BaseModel):
    appointment_id: int | None = None
    prescribed_date: date | None = None


class PrescriptionRead(ORMBase):
    prescription_id: int
    appointment_id: int
    prescribed_date: date | None = None


class MedicineCreate(BaseModel):
    medicine_name: str
    unit_price: float | None = None


class MedicineUpdate(BaseModel):
    medicine_name: str | None = None
    unit_price: float | None = None


class MedicineRead(ORMBase):
    medicine_id: int
    medicine_name: str
    unit_price: float | None = None


class PrescribedMedicineCreate(BaseModel):
    prescription_id: int
    medicine_id: int
    dosage: str | None = None
    duration: str | None = None
    quantity: int | None = None
    unit_price: float | None = None
    amount: float | None = None


class PrescribedMedicineUpdate(BaseModel):
    prescription_id: int | None = None
    medicine_id: int | None = None
    dosage: str | None = None
    duration: str | None = None
    quantity: int | None = None
    unit_price: float | None = None
    amount: float | None = None


class PrescribedMedicineRead(ORMBase):
    id: int
    prescription_id: int
    medicine_id: int
    dosage: str | None = None
    duration: str | None = None
    quantity: int | None = None
    unit_price: float | None = None
    amount: float | None = None


class LabTestCreate(BaseModel):
    test_name: str
    standard_cost: float | None = None


class LabTestUpdate(BaseModel):
    test_name: str | None = None
    standard_cost: float | None = None


class LabTestRead(ORMBase):
    test_id: int
    test_name: str
    standard_cost: float | None = None


class PrescribedTestCreate(BaseModel):
    appointment_id: int
    test_id: int
    prescribed_date: date | None = None
    result_date: date | None = None
    result_time: time | None = None
    amount: float | None = None
    status: str | None = None


class PrescribedTestUpdate(BaseModel):
    appointment_id: int | None = None
    test_id: int | None = None
    prescribed_date: date | None = None
    result_date: date | None = None
    result_time: time | None = None
    amount: float | None = None
    status: str | None = None


class PrescribedTestRead(ORMBase):
    prescribed_test_id: int
    appointment_id: int
    test_id: int
    prescribed_date: date | None = None
    result_date: date | None = None
    result_time: time | None = None
    amount: float | None = None
    status: str | None = None
