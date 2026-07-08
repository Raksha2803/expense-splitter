import heapq
from decimal import Decimal
from sqlalchemy.orm import Session
from app import models


def calculate_net_balances(group_id: str, db: Session) -> dict:
    """
    Returns a dict of {user_id: net_balance} for everyone in the group.
    Positive balance = this person is owed money overall.
    Negative balance = this person owes money overall.
    """
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        return {}

    balances = {member.id: Decimal("0") for member in group.members}

    expenses = db.query(models.Expense).filter(models.Expense.group_id == group_id).all()

    for expense in expenses:
        balances[expense.paid_by] += expense.amount
        for split in expense.splits:
            balances[split.user_id] -= split.amount_owed

    return balances


def simplify_debts(balances: dict) -> list:
    """
    Greedy approach: repeatedly match whoever owes the MOST money
    with whoever is owed the MOST money, settle as much of that
    pair as possible, and repeat until everyone is at zero.
    """
    creditors = []
    debtors = []

    for user_id, balance in balances.items():
        if balance > 0:
            heapq.heappush(creditors, (-balance, user_id))
        elif balance < 0:
            heapq.heappush(debtors, (balance, user_id))

    transactions = []

    while creditors and debtors:
        credit_amount, creditor_id = heapq.heappop(creditors)
        debt_amount, debtor_id = heapq.heappop(debtors)

        credit_amount = -credit_amount
        debt_amount = -debt_amount

        settled_amount = min(credit_amount, debt_amount)

        transactions.append({
            "from_user": debtor_id,
            "to_user": creditor_id,
            "amount": settled_amount,
        })

        remaining_credit = credit_amount - settled_amount
        remaining_debt = debt_amount - settled_amount

        if remaining_credit > 0:
            heapq.heappush(creditors, (-remaining_credit, creditor_id))
        if remaining_debt > 0:
            heapq.heappush(debtors, (-remaining_debt, debtor_id))

    return transactions