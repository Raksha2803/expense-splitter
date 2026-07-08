import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load variables from .env into the environment
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# The engine manages the actual connection pool to Postgres
engine = create_engine(DATABASE_URL)

# SessionLocal is a factory for creating database "sessions" -
# a session is like a single conversation/transaction with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the class our table models will inherit from
Base = declarative_base()


def get_db():
    """
    This function provides a database session to each API request,
    and makes sure it's closed afterward - even if an error happens.
    We'll plug this into FastAPI's dependency injection system later.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()