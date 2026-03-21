from pydantic import BaseModel
from typing import Optional


class DepartmentCreate(BaseModel):
    dept_name: str
    no_of_staffs: int = 0


class DepartmentUpdate(BaseModel):
    dept_name: Optional[str] = None
    no_of_staffs: Optional[int] = None


class DepartmentResponse(BaseModel):
    dept_id: int
    dept_name: str
    no_of_staffs: int

    class Config:
        from_attributes = True
