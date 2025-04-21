from __future__ import annotations
from datetime import datetime
from typing import List, Optional

from fastapi import Form
from pydantic import BaseModel, Field, EmailStr


# ────────────────────────────────────────────────────────────────
# Out‑schemas  (unchanged)
# ────────────────────────────────────────────────────────────────
class PromoCodeOut(BaseModel):
    id: int
    code: str
    expires_at: datetime

    model_config = {"from_attributes": True}


class CourseOut(BaseModel):
    id: int
    title: str
    price: float
    image_url: str
    udemy_url: str
    promo_codes: List[PromoCodeOut] = []

    model_config = {"from_attributes": True}


# ────────────────────────────────────────────────────────────────
# In‑schemas
# ────────────────────────────────────────────────────────────────
class PromoCreate(BaseModel):
    """
    Used with Depends() on /courses/{id}/promo

    • code       – optional Udemy coupon code
    • days_valid – default 5 days, min 1, max 365
    """

    code: Optional[str] = Form(default=None)
    days_valid: int = Form(default=5, ge=1, le=365)


class SubscriberCreate(BaseModel):
    email: EmailStr
