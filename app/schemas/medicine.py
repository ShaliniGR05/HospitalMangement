from pydantic import BaseModel
from typing import Optional


class MedicineCreate(BaseModel):
    medicine_name: str
    unit_price: float


class MedicineUpdate(BaseModel):
    medicine_name: Optional[str] = None
    unit_price: Optional[float] = None


class MedicineResponse(BaseModel):
    medicine_id: int
    medicine_name: str
    unit_price: float

    class Config:
        from_attributes = True
