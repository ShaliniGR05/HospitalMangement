from pydantic import BaseModel
from typing import Optional


class PrescribedMedicineCreate(BaseModel):
    prescription_id: int
    medicine_id: int
    dosage: Optional[str] = None
    duration: Optional[str] = None
    quantity: int
    unit_price: float
    amount: float


class PrescribedMedicineUpdate(BaseModel):
    prescription_id: Optional[int] = None
    medicine_id: Optional[int] = None
    dosage: Optional[str] = None
    duration: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    amount: Optional[float] = None


class PrescribedMedicineResponse(BaseModel):
    id: int
    prescription_id: int
    medicine_id: int
    dosage: Optional[str]
    duration: Optional[str]
    quantity: int
    unit_price: float
    amount: float

    class Config:
        from_attributes = True
