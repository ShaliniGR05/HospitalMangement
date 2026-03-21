from pydantic import BaseModel
from typing import Optional
from datetime import date


class PatientCreate(BaseModel):
    patient_name: str
    gender: str
    age: int
    phone_num: str
    address: Optional[str] = None
    blood_group: Optional[str] = None
    registration_date: date


class PatientUpdate(BaseModel):
    patient_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    phone_num: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    registration_date: Optional[date] = None


class PatientResponse(BaseModel):
    patient_id: int
    patient_name: str
    gender: str
    age: int
    phone_num: str
    address: Optional[str]
    blood_group: Optional[str]
    registration_date: date

    class Config:
        from_attributes = True
