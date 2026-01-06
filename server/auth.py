from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
# from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

import os
# print("DEBUG: auth.py - loading dotenv")
from dotenv import load_dotenv

# Load Env
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / "server" / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# print("DEBUG: auth.py - loading secrets")
# Secret key for signing JWTs
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_secret_for_dev_only_change_in_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# print("DEBUG: auth.py - initializing CryptContext")
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# print("DEBUG: auth.py - CryptContext initialized")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

def verify_password(plain_password, hashed_password):
    # Mock verification for now (since passlib is removed)
    return plain_password == hashed_password

def get_password_hash(password):
    # Mock hashing for now
    return password
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except JWTError:
        raise credentials_exception
    return token_data
