from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship


class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    price: float
    image_url: str
    udemy_url: str

    # 1‑n‑Relation –  simple list‑Annotation reicht bei SQLModel
    promo_codes: list["PromoCode"] = Relationship(back_populates="course")


class PromoCode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str
    expires_at: datetime

    course_id: int = Field(foreign_key="course.id")
    course: Optional[Course] = Relationship(back_populates="promo_codes")


class Subscriber(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
