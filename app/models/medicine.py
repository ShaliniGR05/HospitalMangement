from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    medicine_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medicine_name = Column(String, nullable=False)
    unit_price = Column(Float, nullable=False)
