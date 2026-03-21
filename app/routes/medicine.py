from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])


@router.get("/", response_model=List[MedicineResponse])
async def get_all_medicines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Medicine))
    return result.scalars().all()


@router.get("/{medicine_id}", response_model=MedicineResponse)
async def get_medicine(medicine_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Medicine).where(Medicine.medicine_id == medicine_id))
    medicine = result.scalar_one_or_none()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine


@router.post("/", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
async def create_medicine(
    data: MedicineCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    medicine = Medicine(**data.model_dump())
    db.add(medicine)
    await db.flush()
    await db.refresh(medicine)
    return medicine


@router.put("/{medicine_id}", response_model=MedicineResponse)
async def update_medicine(
    medicine_id: int,
    data: MedicineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Medicine).where(Medicine.medicine_id == medicine_id))
    medicine = result.scalar_one_or_none()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(medicine, key, value)

    await db.flush()
    await db.refresh(medicine)
    return medicine


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medicine(
    medicine_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Medicine).where(Medicine.medicine_id == medicine_id))
    medicine = result.scalar_one_or_none()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    await db.delete(medicine)
