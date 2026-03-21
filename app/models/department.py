from sqlalchemy import Column, Integer, String
from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    dept_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dept_name = Column(String, nullable=False)
    no_of_staffs = Column(Integer, default=0)
