from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app import balances

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("/", response_model=schemas.GroupResponse)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    # Check the creator actually exists before making a group for them
    creator = db.query(models.User).filter(models.User.id == group.created_by).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator user not found")

    new_group = models.Group(name=group.name, created_by=group.created_by)

    # Automatically add the creator as the first member of their own group
    new_group.members.append(creator)

    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group


@router.post("/{group_id}/members", response_model=schemas.GroupResponse)
def add_member(group_id: str, request: schemas.AddMemberRequest, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user in group.members:
        raise HTTPException(status_code=400, detail="User is already a member of this group")

    group.members.append(user)
    db.commit()
    db.refresh(group)
    return group


@router.get("/", response_model=List[schemas.GroupResponse])
def get_groups(db: Session = Depends(get_db)):
    return db.query(models.Group).all()


@router.get("/{group_id}", response_model=schemas.GroupResponse)
def get_group(group_id: str, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.get("/{group_id}/balances")
def get_balances(group_id: str, db: Session = Depends(get_db)):
    net_balances = balances.calculate_net_balances(group_id, db)
    return {str(user_id): float(amount) for user_id, amount in net_balances.items()}


@router.get("/{group_id}/settlements")
def get_settlements(group_id: str, db: Session = Depends(get_db)):
    net_balances = balances.calculate_net_balances(group_id, db)
    transactions = balances.simplify_debts(net_balances)
    return [
        {"from_user": str(t["from_user"]), "to_user": str(t["to_user"]), "amount": float(t["amount"])}
        for t in transactions
    ]