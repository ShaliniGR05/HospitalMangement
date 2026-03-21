from pydantic import BaseModel
from typing import Optional
from datetime import date


class StaffCreate(BaseModel):
    staff_name: str
    gender: str
    phone: str
    email: str
    address: Optional[str] = None
    dept_id: int
    role: str
    salary: float
    joining_date: date
    status: str = "available"


class StaffUpdate(BaseModel):
    staff_name: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    dept_id: Optional[int] = None
    role: Optional[str] = None
    salary: Optional[float] = None
    joining_date: Optional[date] = None
    status: Optional[str] = None


class StaffResponse(BaseModel):
    staff_id: int
    staff_name: str
    gender: str
    phone: str
    email: str
    address: Optional[str]
    dept_id: int
    role: str
    salary: float
    joining_date: date
    status: str

    class Config:
        from_attributes = True
