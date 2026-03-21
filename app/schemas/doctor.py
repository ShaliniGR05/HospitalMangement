from pydantic import BaseModel
from typing import Optional


class DoctorCreate(BaseModel):
    staff_id: int
    specialization: str
    qualification: str
    experience: int = 0
    no_of_patients: int = 0


class DoctorUpdate(BaseModel):
    staff_id: Optional[int] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[int] = None
    no_of_patients: Optional[int] = None


class DoctorResponse(BaseModel):
    doc_id: int
    staff_id: int
    specialization: str
    qualification: str
    experience: int
    no_of_patients: int

    class Config:
        from_attributes = True
