from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    driver_score: int
    stla_id: Optional[str] = None

@router.post("/login", response_model=UserProfile)
async def login(user: UserLogin):
    # Mock authentication for prototype
    if user.email == "demo@stellantis.com" and user.password == "demo2026":
        return UserProfile(
            id="stla-drv-001",
            email=user.email,
            name="Alex Mercer",
            driver_score=94,
            stla_id="STLA-V-5542"
        )
    raise HTTPException(status_code=401, detail="Invalid credentials. Use demo@stellantis.com / demo2026")
