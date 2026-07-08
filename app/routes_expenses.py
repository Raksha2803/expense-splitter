from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=schemas.ExpenseResponse)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    group = db.query(models.Group).filter(models.Group.id == expense.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if current_user not in group.members:
        raise HTTPException(status_code=400, detail="You are not a member of this group")

    total_split = sum(s.amount_owed for s in expense.splits)
    if total_split != expense.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Splits sum to {total_split}, but expense amount is {expense.amount}",
        )

    member_ids = {member.id for member in group.members}
    for split in expense.splits:
        if split.user_id not in member_ids:
            raise HTTPException(
                status_code=400,
                detail=f"User {split.user_id} is not a member of this group",
            )

    new_expense = models.Expense(
        group_id=expense.group_id,
        paid_by=current_user.id,
        amount=expense.amount,
        description=expense.description,
    )
    db.add(new_expense)
    db.flush()

    for split in expense.splits:
        new_split = models.Split(
            expense_id=new_expense.id,
            user_id=split.user_id,
            amount_owed=split.amount_owed,
        )
        db.add(new_split)

    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.get("/group/{group_id}", response_model=List[schemas.ExpenseResponse])
def get_group_expenses(group_id: str, db: Session = Depends(get_db)):
    return db.query(models.Expense).filter(models.Expense.group_id == group_id).all()