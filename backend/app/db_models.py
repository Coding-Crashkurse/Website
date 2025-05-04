"""DB-Modelle – Coding Crash Courses (SQLModel)"""

from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


# ─────────────────────────── PromoCode ───────────────────────────
class PromoCode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True)
    expires_at: datetime

    course_id: int = Field(foreign_key="course.id")
    course: Optional["Course"] = Relationship(back_populates="promo_codes")


# ─────────────────────────── Course ──────────────────────────────
class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(unique=True, index=True)
    price: float
    image_url: str
    udemy_url: str

    promo_codes: List[PromoCode] = Relationship(back_populates="course")


# ────────────────────────── Subscriber ───────────────────────────
class Subscriber(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────── ChatLog ─────────────────────────────
class ChatLog(SQLModel, table=True):
    """Speichert jedes Q/A-Paar der Chat-API."""
    id: Optional[int] = Field(default=None, primary_key=True)
    thread_id: str = Field(index=True)
    question: str
    answer: str
    tokens_question: int
    tokens_answer: int
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
