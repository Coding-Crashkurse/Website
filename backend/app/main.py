#!/usr/bin/env python
# coding: utf-8
"""
FastAPI backend – Coding Crash Courses
"""
from __future__ import annotations

import asyncio
import contextlib
import os
import uuid
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Deque, Dict, List

import tiktoken
from cachetools import TTLCache
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from langchain_core.messages import AIMessage, HumanMessage
from sqlalchemy import delete
from sqlmodel import Session, SQLModel, select
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from .db_models import ChatLog, Course, PromoCode
from .schemas import (
    ChatRequest,
    ChatResponse,
    CourseOut,
    PromoCodeOut,
    PromoCreate,
)
from .chat_graph import build_graph
from .database import engine, get_session

# ────────────────────────── Konfiguration ──────────────────────────
ADMIN_USER = os.getenv("POSTGRES_USER")
ADMIN_PASS = os.getenv("POSTGRES_PASSWORD")
if not (ADMIN_USER and ADMIN_PASS):
    raise RuntimeError("POSTGRES_USER / POSTGRES_PASSWORD müssen gesetzt sein")

_LIMIT_HOUR = 10
_LIMIT_DAY = 120
_LOG_RETENTION = timedelta(weeks=4)
_CLEANUP_PERIOD = 60 * 60 * 24  # 24 h

_IP_LOG: TTLCache[str, Deque[datetime]] = TTLCache(maxsize=10_000, ttl=60 * 60 * 24)
_LOCK = asyncio.Lock()

ENCODER = tiktoken.get_encoding("cl100k_base")
GRAPH = build_graph()

IMAGE_MAP: dict[str, tuple[float, str]] = {
    "LangGraph in Action: Develop Advanced AI Agents with LLMs": (
        54.99, "https://img-c.udemycdn.com/course/750x422/6359927_fb55_3.jpg"
    ),
    "Advanced LangChain Techniques: Mastering RAG Applications": (
        49.99, "https://img-c.udemycdn.com/course/750x422/6052857_31ba_3.jpg"
    ),
    "LangChain on Azure - Building Scalable LLM Applications": (
        34.99, "https://img-c.udemycdn.com/course/750x422/5734832_ba74.jpg"
    ),
    "LangChain in Action: Develop LLM-Powered Applications": (
        27.99, "https://img-c.udemycdn.com/course/750x422/5621170_d56e_2.jpg"
    ),
    "FastAPI für Anfänger - Baue einen Twitter Clone mit FastAPI": (
        44.99, "https://img-c.udemycdn.com/course/750x422/5055186_4547_3.jpg"
    ),
}

# ────────────────────────── Hilfsfunktionen ─────────────────────────
def _utc_now() -> datetime:
    """Naive UTC-Zeit (für konsistente Vergleiche & DB-Speicherung)."""
    return datetime.utcnow()


def token_len(text: str) -> int:
    return len(ENCODER.encode(text))


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else request.client.host


def basic_auth(credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    if (credentials.username, credentials.password) != (ADMIN_USER, ADMIN_PASS):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Basic"},
        )


async def check_ip_rate_limit(ip: str) -> None:
    now = _utc_now()
    async with _LOCK:
        q = _IP_LOG.setdefault(ip, deque())
        while q and (now - q[0]) > timedelta(hours=1):
            q.popleft()
        hour_cnt, day_cnt = len(q), len(q)
        if hour_cnt >= _LIMIT_HOUR or day_cnt >= _LIMIT_DAY:
            raise HTTPException(429, "Rate-Limit erreicht")
        q.append(now)


def quota_snapshot(ip: str) -> Dict[str, int | bool]:
    now = _utc_now()
    q = _IP_LOG.get(ip, deque())
    while q and (now - q[0]) > timedelta(hours=1):
        q.popleft()
    hour_cnt, day_cnt = len(q), len(q)
    return {
        "remaining_hour": max(0, _LIMIT_HOUR - hour_cnt),
        "remaining_day": max(0, _LIMIT_DAY - day_cnt),
        "allowed": hour_cnt < _LIMIT_HOUR and day_cnt < _LIMIT_DAY,
    }


async def _cleanup_chatlogs() -> None:
    cutoff = _utc_now() - _LOG_RETENTION
    with Session(engine) as s:
        s.exec(delete(ChatLog).where(ChatLog.timestamp < cutoff))
        s.commit()

# ───────────────────────── App-Lifecycle ───────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)

    # Demo-Daten einspielen
    with Session(engine) as s:
        s.exec(Course.__table__.delete())
        s.exec(PromoCode.__table__.delete())
        for title, (price, img) in IMAGE_MAP.items():
            s.add(Course(title=title, price=price, image_url=img, udemy_url="https://www.udemy.com"))
        s.commit()

    # Täglicher Cleaner um 00:30 UTC
    async def _scheduler():
        now = _utc_now()
        first = now.replace(hour=0, minute=30, second=0, microsecond=0)
        if first < now:
            first += timedelta(days=1)
        await asyncio.sleep((first - now).total_seconds())
        while True:
            await _cleanup_chatlogs()
            await asyncio.sleep(_CLEANUP_PERIOD)

    cleanup_task = asyncio.create_task(_scheduler())

    try:
        yield
    finally:
        cleanup_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await cleanup_task
        with Session(engine) as s:
            s.exec(ChatLog.__table__.delete())
            s.exec(Course.__table__.delete())
            s.exec(PromoCode.__table__.delete())
            s.commit()
        _IP_LOG.clear()

# ───────────────────────── FastAPI-Instanz ─────────────────────────
app = FastAPI(title="Coding Crash Courses API", lifespan=lifespan)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# ───────────────────────── Routen ──────────────────────────────────
@app.get("/courses", response_model=List[CourseOut])
def list_courses(db: Session = Depends(get_session)):
    now = _utc_now()
    courses = db.exec(select(Course)).all()
    for c in courses:
        c.promo_codes = [p for p in c.promo_codes if p.expires_at > now]
    return courses


@app.post("/courses/{cid}/promo", response_model=PromoCodeOut, dependencies=[Depends(basic_auth)])
def create_promo(cid: int, data: PromoCreate = Depends(), db: Session = Depends(get_session)):
    course = db.get(Course, cid)
    if not course:
        raise HTTPException(404, "Course not found")
    promo = PromoCode(
        code=f"CCC-{cid}-{int(_utc_now().timestamp())}",
        expires_at=_utc_now() + timedelta(days=data.days_valid),
        course_id=cid,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@app.delete("/courses/{cid}/promo", status_code=204, dependencies=[Depends(basic_auth)])
def delete_promo(cid: int, db: Session = Depends(get_session)):
    promos = db.exec(select(PromoCode).where(PromoCode.course_id == cid)).all()
    if not promos:
        raise HTTPException(404, "No active promo found")
    for p in promos:
        db.delete(p)
    db.commit()


@app.get("/chat/status")
async def chat_status(request: Request):
    return quota_snapshot(_client_ip(request))


@app.post("/chat/thread")
def create_thread():
    return {"thread_id": str(uuid.uuid4())}


@app.post("/chat/{thread_id}", response_model=ChatResponse)
async def chat(thread_id: str, data: ChatRequest, request: Request, db: Session = Depends(get_session)):
    if len(data.message.split()) > 1_000:
        raise HTTPException(413, "Input zu lang (≥1000 Wörter)")

    ip = _client_ip(request)
    await check_ip_rate_limit(ip)

    result = await GRAPH.ainvoke(
        {"messages": [HumanMessage(content=data.message)]},
        config={"configurable": {"thread_id": thread_id}},
    )

    try:
        ai_msg = next(m for m in reversed(result["messages"]) if isinstance(m, AIMessage))
    except StopIteration:
        raise HTTPException(500, "LLM lieferte keine AIMessage")

    db.add(ChatLog(
        thread_id=thread_id,
        question=data.message,
        answer=ai_msg.content,
        tokens_question=token_len(data.message),
        tokens_answer=token_len(ai_msg.content),
        timestamp=_utc_now(),
    ))
    db.commit()
    return ChatResponse(reply=ai_msg.content)


@app.get("/stats", dependencies=[Depends(basic_auth)])
def stats(db: Session = Depends(get_session)):
    import pandas as pd

    logs = db.exec(select(ChatLog)).all()
    if not logs:
        return []

    df = pd.DataFrame([{
        "timestamp": l.timestamp,
        "tokens_q": l.tokens_question,
        "tokens_a": l.tokens_answer,
    } for l in logs])

    df["date"] = df["timestamp"].dt.date

    agg = (
        df.groupby("date")
        .agg(
            requests=("timestamp", "count"),
            avg_q_tokens=("tokens_q", "mean"),
            avg_a_tokens=("tokens_a", "mean"),
            total_q_tokens=("tokens_q", "sum"),
            total_a_tokens=("tokens_a", "sum"),
        )
        .reset_index()
    )

    agg["total_tokens"] = agg["total_q_tokens"] + agg["total_a_tokens"]
    agg = agg.drop(columns=["total_q_tokens", "total_a_tokens"])

    agg["date"] = agg["date"].astype(str)
    cols = ["requests", "avg_q_tokens", "avg_a_tokens", "total_tokens"]
    agg[cols] = agg[cols].round(0).astype(int)

    return agg.to_dict(orient="records")
