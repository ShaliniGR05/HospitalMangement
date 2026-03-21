from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class LabTest(Base):
    __tablename__ = "lab_tests"

    test_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    test_name = Column(String, nullable=False)
    standard_cost = Column(Float, nullable=False)
