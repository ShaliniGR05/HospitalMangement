from pydantic import BaseModel
from typing import Optional
from datetime import date


class ConsultationBillingCreate(BaseModel):
    appointment_id: int
    amount: float
    payment_status: str = "pending"
    payment_date: Optional[date] = None


class ConsultationBillingUpdate(BaseModel):
    amount: Optional[float] = None
    payment_status: Optional[str] = None
    payment_date: Optional[date] = None


class ConsultationBillingResponse(BaseModel):
    consultation_bill_id: int
    appointment_id: int
    amount: float
    payment_status: str
    payment_date: Optional[date]

    class Config:
        from_attributes = True
