from pydantic import BaseModel
from typing import Optional


class LabTestCreate(BaseModel):
    test_name: str
    standard_cost: float


class LabTestUpdate(BaseModel):
    test_name: Optional[str] = None
    standard_cost: Optional[float] = None


class LabTestResponse(BaseModel):
    test_id: int
    test_name: str
    standard_cost: float

    class Config:
        from_attributes = True
