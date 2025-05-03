from __future__ import annotations

from datetime import datetime
from typing import List

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):  # common metadata base
    pass


# ─────────────────────────── Course ───────────────────────────
class Course(Base):
    __tablename__ = "course"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str]         # UNIQUE below
    price: Mapped[float]
    image_url: Mapped[str]
    udemy_url: Mapped[str]

    # relationship: one course → many promo codes
    promo_codes: Mapped[List["PromoCode"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("title", name="uix_course_title"),
    )


# ───────────────────────── Promo-code ─────────────────────────
class PromoCode(Base):
    __tablename__ = "promocode"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str]
    expires_at: Mapped[datetime]

    course_id: Mapped[int] = mapped_column(
        ForeignKey("course.id", ondelete="CASCADE")
    )
    course: Mapped[Course] = relationship(back_populates="promo_codes")


# ───────────────────────── Subscriber ─────────────────────────
class Subscriber(Base):
    __tablename__ = "subscriber"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("email", name="uix_subscriber_email"),
    )
