from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.prescribed_medicine import PrescribedMedicine
from app.schemas.prescribed_medicine import (
    PrescribedMedicineCreate,
    PrescribedMedicineUpdate,
    PrescribedMedicineResponse,
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/prescribed-medicines", tags=["Prescribed Medicines"])


@router.get("/", response_model=List[PrescribedMedicineResponse])
async def get_all_prescribed_medicines(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(PrescribedMedicine))
    return result.scalars().all()


@router.get("/{id}", response_model=PrescribedMedicineResponse)
async def get_prescribed_medicine(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(PrescribedMedicine).where(PrescribedMedicine.id == id)
    )
    prescribed_medicine = result.scalar_one_or_none()
    if not prescribed_medicine:
        raise HTTPException(status_code=404, detail="Prescribed medicine not found")
    return prescribed_medicine


@router.post("/", response_model=PrescribedMedicineResponse, status_code=status.HTTP_201_CREATED)
async def create_prescribed_medicine(
    data: PrescribedMedicineCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    prescribed_medicine = PrescribedMedicine(**data.model_dump())
    db.add(prescribed_medicine)
    await db.flush()
    await db.refresh(prescribed_medicine)
    return prescribed_medicine


@router.put("/{id}", response_model=PrescribedMedicineResponse)
async def update_prescribed_medicine(
    id: int,
    data: PrescribedMedicineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(PrescribedMedicine).where(PrescribedMedicine.id == id)
    )
    prescribed_medicine = result.scalar_one_or_none()
    if not prescribed_medicine:
        raise HTTPException(status_code=404, detail="Prescribed medicine not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prescribed_medicine, key, value)

    await db.flush()
    await db.refresh(prescribed_medicine)
    return prescribed_medicine


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prescribed_medicine(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(PrescribedMedicine).where(PrescribedMedicine.id == id)
    )
    prescribed_medicine = result.scalar_one_or_none()
    if not prescribed_medicine:
        raise HTTPException(status_code=404, detail="Prescribed medicine not found")
    await db.delete(prescribed_medicine)
