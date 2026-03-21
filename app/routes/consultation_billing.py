from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.consultation_billing import ConsultationBilling
from app.schemas.consultation_billing import (
    ConsultationBillingCreate,
    ConsultationBillingUpdate,
    ConsultationBillingResponse,
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/consultation-billing", tags=["Consultation Billing"])


@router.get("/", response_model=List[ConsultationBillingResponse])
async def get_all_bills(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(ConsultationBilling))
    return result.scalars().all()


@router.get("/{bill_id}", response_model=ConsultationBillingResponse)
async def get_bill(
    bill_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(ConsultationBilling).where(
            ConsultationBilling.consultation_bill_id == bill_id
        )
    )
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Consultation bill not found")
    return bill


@router.post("/", response_model=ConsultationBillingResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(
    data: ConsultationBillingCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    bill = ConsultationBilling(**data.model_dump())
    db.add(bill)
    await db.flush()
    await db.refresh(bill)
    return bill


@router.put("/{bill_id}", response_model=ConsultationBillingResponse)
async def update_bill(
    bill_id: int,
    data: ConsultationBillingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(ConsultationBilling).where(
            ConsultationBilling.consultation_bill_id == bill_id
        )
    )
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Consultation bill not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(bill, key, value)

    await db.flush()
    await db.refresh(bill)
    return bill


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bill(
    bill_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(ConsultationBilling).where(
            ConsultationBilling.consultation_bill_id == bill_id
        )
    )
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Consultation bill not found")
    await db.delete(bill)
