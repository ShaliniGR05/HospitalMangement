from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


@router.get("/", response_model=List[DoctorResponse])
async def get_all_doctors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Doctor))
    return result.scalars().all()


@router.get("/{doc_id}", response_model=DoctorResponse)
async def get_doctor(doc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Doctor).where(Doctor.doc_id == doc_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.post("/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    data: DoctorCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    doctor = Doctor(**data.model_dump())
    db.add(doctor)
    await db.flush()
    await db.refresh(doctor)
    return doctor


@router.put("/{doc_id}", response_model=DoctorResponse)
async def update_doctor(
    doc_id: int,
    data: DoctorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Doctor).where(Doctor.doc_id == doc_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(doctor, key, value)

    await db.flush()
    await db.refresh(doctor)
    return doctor


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Doctor).where(Doctor.doc_id == doc_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    await db.delete(doctor)
