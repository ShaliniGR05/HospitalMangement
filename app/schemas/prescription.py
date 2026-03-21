from pydantic import BaseModel
from typing import Optional
from datetime import date


class PrescriptionCreate(BaseModel):
    appointment_id: int
    prescribed_date: date


class PrescriptionUpdate(BaseModel):
    appointment_id: Optional[int] = None
    prescribed_date: Optional[date] = None


class PrescriptionResponse(BaseModel):
    prescription_id: int
    appointment_id: int
    prescribed_date: date

    class Config:
        from_attributes = True
