from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.lab_test import LabTest
from app.schemas.lab_test import LabTestCreate, LabTestUpdate, LabTestResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/lab-tests", tags=["Lab Tests"])


@router.get("/", response_model=List[LabTestResponse])
async def get_all_lab_tests(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LabTest))
    return result.scalars().all()


@router.get("/{test_id}", response_model=LabTestResponse)
async def get_lab_test(test_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LabTest).where(LabTest.test_id == test_id))
    lab_test = result.scalar_one_or_none()
    if not lab_test:
        raise HTTPException(status_code=404, detail="Lab test not found")
    return lab_test


@router.post("/", response_model=LabTestResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_test(
    data: LabTestCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    lab_test = LabTest(**data.model_dump())
    db.add(lab_test)
    await db.flush()
    await db.refresh(lab_test)
    return lab_test


@router.put("/{test_id}", response_model=LabTestResponse)
async def update_lab_test(
    test_id: int,
    data: LabTestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(LabTest).where(LabTest.test_id == test_id))
    lab_test = result.scalar_one_or_none()
    if not lab_test:
        raise HTTPException(status_code=404, detail="Lab test not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lab_test, key, value)

    await db.flush()
    await db.refresh(lab_test)
    return lab_test


@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lab_test(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(LabTest).where(LabTest.test_id == test_id))
    lab_test = result.scalar_one_or_none()
    if not lab_test:
        raise HTTPException(status_code=404, detail="Lab test not found")
    await db.delete(lab_test)
