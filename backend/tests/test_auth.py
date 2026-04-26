"""
test_auth.py
============
Tests for /auth/signup and /auth/login endpoints.
Uses shared client + DB fixtures from conftest.py.
"""

import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def signup(client, email, password="testpass123"):
    return client.post("/auth/signup", json={"email": email, "password": password})


def login(client, email, password="testpass123"):
    return client.post("/auth/login", json={"email": email, "password": password})


# ---------------------------------------------------------------------------
# Signup tests
# ---------------------------------------------------------------------------
class TestSignup:
    def test_signup_success(self, client):
        response = signup(client, "test@example.com")
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_signup_duplicate_email(self, client):
        signup(client, "dup@example.com")
        response = signup(client, "dup@example.com")
        assert response.status_code == 409

    def test_signup_invalid_email(self, client):
        response = signup(client, "not-an-email")
        assert response.status_code == 422

    def test_signup_missing_fields(self, client):
        response = client.post("/auth/signup", json={"email": "missing@example.com"})
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# Login tests
# ---------------------------------------------------------------------------
class TestLogin:
    def test_login_success(self, client):
        signup(client, "login@example.com")
        response = login(client, "login@example.com")
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_wrong_password(self, client):
        signup(client, "wrong@example.com")
        response = login(client, "wrong@example.com", password="wrongpass")
        assert response.status_code == 401

    def test_login_nonexistent_email(self, client):
        response = login(client, "ghost@example.com")
        assert response.status_code == 401

    def test_login_returns_valid_token(self, client):
        signup(client, "tokentest@example.com")
        token = login(client, "tokentest@example.com").json()["access_token"]
        response = client.get(
            "/get-mood-history", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

    def test_protected_endpoint_without_token(self, client):
        response = client.get("/get-mood-history")
        assert response.status_code == 403  # HTTPBearer returns 403 when missing
