import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Google Auth Imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.services.auth_service import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

# IMPORTANT: Paste your exact Client ID here!
GOOGLE_CLIENT_ID = "165775322221-6v6dmvv9t5aa6stgdeu5eq2p1aehjhd6.apps.googleusercontent.com"

# ─── Schema for Google Auth ───────────────────────────────────────────────────
class GoogleAuthRequest(BaseModel):
    token: str
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(request: Request, body: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user.

    - Checks for duplicate email.
    - Hashes password with bcrypt.
    - Persists user and returns a JWT.
    """
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Note: If your SignupRequest includes first_name and last_name now, 
    # you can add them here: first_name=body.first_name, last_name=body.last_name
    new_user = User(
        email=body.email,
        password_hash=hash_password(body.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate an existing user and return a JWT.

    Raises:
        401: If the email is not found or the password is incorrect.
    """
    user = db.query(User).filter(User.email == body.email).first()

    # Use a generic error to avoid user-enumeration attacks
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=token)


# ─── NEW: Google Login Endpoint ───────────────────────────────────────────────
@router.post("/google", response_model=TokenResponse)
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Verifies Google token, creates user if they don't exist, and returns a JWT."""
    try:
        # 1. Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            request.token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        # 2. Extract user info from Google's response
        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        if not email:
            raise HTTPException(status_code=400, detail="Google token did not contain an email.")

        # 3. Check if this user already exists in your database
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # 4. Create a brand new user!
            # Generate a random, impossible-to-guess 32-character password
            alphabet = string.ascii_letters + string.digits
            random_password = ''.join(secrets.choice(alphabet) for i in range(32))
            
            # Use your existing hash_password function!
            hashed_password = hash_password(random_password)

            user = User(
                email=email,
                password_hash=hashed_password,
                first_name=first_name,
                last_name=last_name
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # 5. Generate your standard MindMate JWT token using your existing function!
        token = create_access_token(data={"sub": str(user.id)})

        return TokenResponse(access_token=token)

    except ValueError:
        # Invalid token
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token.")
    except Exception as e:
        print(f"Google Auth Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Something went wrong during Google Authentication.")