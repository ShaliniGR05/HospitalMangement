from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Staff(Base):
    __tablename__ = "staffs"

    staff_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    staff_name = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    address = Column(String)
    dept_id = Column(Integer, ForeignKey("departments.dept_id"), nullable=False)
    role = Column(String, nullable=False)
    salary = Column(Float, nullable=False)
    joining_date = Column(Date, nullable=False)
    status = Column(String, default="available")  # available / offline

    department = relationship("Department", backref="staffs", lazy="selectin")
