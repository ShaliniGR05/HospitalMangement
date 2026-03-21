from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.prescribed_test import PrescribedTest
from app.schemas.prescribed_test import (
    PrescribedTestCreate,
    PrescribedTestUpdate,
    PrescribedTestResponse,
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/prescribed-tests", tags=["Prescribed Tests"])


@router.get("/", response_model=List[PrescribedTestResponse])
async def get_all_prescribed_tests(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(PrescribedTest))
    return result.scalars().all()


@router.get("/{prescribed_test_id}", response_model=PrescribedTestResponse)
async def get_prescribed_test(
    prescribed_test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(PrescribedTest).where(
            PrescribedTest.prescribed_test_id == prescribed_test_id
        )
    )
    prescribed_test = result.scalar_one_or_none()
    if not prescribed_test:
        raise HTTPException(status_code=404, detail="Prescribed test not found")
    return prescribed_test


@router.post("/", response_model=PrescribedTestResponse, status_code=status.HTTP_201_CREATED)
async def create_prescribed_test(
    data: PrescribedTestCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    prescribed_test = PrescribedTest(**data.model_dump())
    db.add(prescribed_test)
    await db.flush()
    await db.refresh(prescribed_test)
    return prescribed_test


@router.put("/{prescribed_test_id}", response_model=PrescribedTestResponse)
async def update_prescribed_test(
    prescribed_test_id: int,
    data: PrescribedTestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(PrescribedTest).where(
            PrescribedTest.prescribed_test_id == prescribed_test_id
        )
    )
    prescribed_test = result.scalar_one_or_none()
    if not prescribed_test:
        raise HTTPException(status_code=404, detail="Prescribed test not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prescribed_test, key, value)

    await db.flush()
    await db.refresh(prescribed_test)
    return prescribed_test


@router.delete("/{prescribed_test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prescribed_test(
    prescribed_test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(PrescribedTest).where(
            PrescribedTest.prescribed_test_id == prescribed_test_id
        )
    )
    prescribed_test = result.scalar_one_or_none()
    if not prescribed_test:
        raise HTTPException(status_code=404, detail="Prescribed test not found")
    await db.delete(prescribed_test)
