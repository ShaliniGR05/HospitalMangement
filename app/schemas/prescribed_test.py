from pydantic import BaseModel
from typing import Optional
from datetime import date, time


class PrescribedTestCreate(BaseModel):
    appointment_id: int
    test_id: int
    prescribed_date: date
    result_date: Optional[date] = None
    result_time: Optional[time] = None
    amount: float
    status: str = "pending"


class PrescribedTestUpdate(BaseModel):
    appointment_id: Optional[int] = None
    test_id: Optional[int] = None
    prescribed_date: Optional[date] = None
    result_date: Optional[date] = None
    result_time: Optional[time] = None
    amount: Optional[float] = None
    status: Optional[str] = None


class PrescribedTestResponse(BaseModel):
    prescribed_test_id: int
    appointment_id: int
    test_id: int
    prescribed_date: date
    result_date: Optional[date]
    result_time: Optional[time]
    amount: float
    status: str

    class Config:
        from_attributes = True
