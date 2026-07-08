# Expense Splitter

A full-stack group expense-splitting app (similar to Splitwise) with automatic debt simplification - it calculates the minimum number of transactions needed to settle everyone's balances in a group, instead of tracking every individual expense as a separate debt.

## Features

- User signup and login with JWT-based authentication (passwords hashed with bcrypt)
- Create groups and add members
- Add expenses with custom splits between group members
- Automatic calculation of each member's net balance
- **Debt simplification algorithm**: uses a greedy approach with max-heaps to reduce a group's tangled debts into the minimum number of settlement transactions
- React frontend with a live dashboard: groups, expenses, and settlement summary

## Tech stack

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, JWT (python-jose), bcrypt
**Frontend:** React (Vite), Axios

## The core algorithm

Given a group's expenses, the app:

1. Calculates each person's **net balance**: `total_paid - total_owed`
2. Runs a **greedy settlement algorithm**: repeatedly matches the person owed the most money with the person who owes the most money, using two max-heaps, until all balances reach zero

This means that even if a group has 10 expenses generating dozens of individual debt relationships, the app resolves it into the minimum number of actual payments needed - e.g., a group of 5 people with 15 expenses might naively imply 20+ pairwise debts, but this reduces to at most 4 transactions (at most n-1 for n people).

## Running it locally

### Backend

\`\`\`bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
\`\`\`

Create a `.env` file in the project root:
\`\`\`
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_splitter
SECRET_KEY=your-random-secret-key
\`\`\`

Run the server:
\`\`\`bash
python -m uvicorn app.main:app --reload
\`\`\`

API docs available at `http://localhost:8000/docs`

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

App available at `http://localhost:5173`

## Project structure

\`\`\`
expense-splitter/
├── app/
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # DB connection setup
│   ├── models.py         # SQLAlchemy table models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── auth.py            # JWT + password handling
│   ├── balances.py         # Net balance + debt simplification logic
│   ├── routes_users.py
│   ├── routes_groups.py
│   ├── routes_expenses.py
│   └── routes_auth.py
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── LoginPage.jsx
│       ├── SignupPage.jsx
│       ├── GroupsPage.jsx
│       ├── GroupDetailPage.jsx
│       └── api.js
└── requirements.txt
\`\`\`

## What I'd add with more time

- Support for unequal/percentage-based splits directly in the UI (currently only equal splits are exposed in the form, though the backend supports arbitrary splits)
- Recurring expenses
- Email notifications when added to a group or expense
- Automated tests for the settlement algorithm