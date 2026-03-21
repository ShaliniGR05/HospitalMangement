from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffUpdate, StaffResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/staff", tags=["Staff"])


@router.get("/", response_model=List[StaffResponse])
async def get_all_staff(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Staff))
    return result.scalars().all()


@router.get("/{staff_id}", response_model=StaffResponse)
async def get_staff(staff_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Staff).where(Staff.staff_id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff


@router.post("/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(
    data: StaffCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    staff = Staff(**data.model_dump())
    db.add(staff)
    await db.flush()
    await db.refresh(staff)
    return staff


@router.put("/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: int,
    data: StaffUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Staff).where(Staff.staff_id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(staff, key, value)

    await db.flush()
    await db.refresh(staff)
    return staff


@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    staff_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Staff).where(Staff.staff_id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    await db.delete(staff)
