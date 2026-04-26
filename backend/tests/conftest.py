"""
conftest.py — Shared pytest fixtures for all test files.

Sets TESTING=true BEFORE any app module is imported so that the app
factory creates a rate-limiter with enabled=False.
"""

import os
import pytest

# Must be set before any `from app.xxx import ...` happens in test files.
os.environ["TESTING"] = "true"

from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app

# ---------------------------------------------------------------------------
# Single SQLite DB shared across all tests
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite:///./test_mindmate_shared.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def reset_db():
    """Drop and recreate all tables before each test for full isolation."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    """Shared TestClient across all tests in the session."""
    with TestClient(app) as c:
        yield c
