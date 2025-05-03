#!/usr/bin/env python
# coding: utf-8
"""
FastAPI backend – Coding Crash Courses

Guards
• input ≤ 1000 words
• per-IP rate-limit (_LIMIT_HOUR / _LIMIT_DAY)
• GET /chat/status → quota snapshot

Startup  : init DB + seed demo courses (no duplicates)
Shutdown : delete rows from all tables + clear in-memory quota
"""
from __future__ import annotations

import asyncio
import os
import uuid
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Deque, Dict, List

from cachetools import TTLCache
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from langchain_core.messages import AIMessage, HumanMessage
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware  # ✅ works on any Uvicorn

# ─────────────────────────── local imports ────────────────────────────
from .database import SessionLocal, get_session, init_db
from .db_models import Course, PromoCode
from .schemas import (
    ChatRequest,
    ChatResponse,
    CourseOut,
    PromoCodeOut,
    PromoCreate,
)
from .chat_graph import build_graph
# --------------------------------------------------------------------- #

# ───────────────────────────── Constants ───────────────────────────── #
ADMIN_USER = os.getenv("PROMO_ADMIN_USER")
ADMIN_PASS = os.getenv("PROMO_ADMIN_PASS")

if not (ADMIN_USER and ADMIN_PASS):
    raise RuntimeError(
        "Environment variables PROMO_ADMIN_USER / PROMO_ADMIN_PASS must be set!"
    )

_LIMIT_HOUR = 100      # max messages per hour / IP
_LIMIT_DAY  = 2        # max messages per day  / IP (low for testing)

# in-memory quota: { ip: deque[timestamps] } – auto-expires after 24 h
_IP_LOG: TTLCache[str, Deque[datetime]] = TTLCache(
    maxsize=10_000, ttl=60 * 60 * 24
)
_LOCK = asyncio.Lock()

# Demo course catalog
IMAGE_MAP: dict[str, tuple[float, str]] = {
    "LangGraph in Action: Develop Advanced AI Agents with LLMs":
        (54.99, "https://img-c.udemycdn.com/course/750x422/6359927_fb55_3.jpg"),
    "Advanced LangChain Techniques: Mastering RAG Applications":
        (49.99, "https://img-c.udemycdn.com/course/750x422/6052857_31ba_3.jpg"),
    "LangChain on Azure - Building Scalable LLM Applications":
        (34.99, "https://img-c.udemycdn.com/course/750x422/5734832_ba74.jpg"),
    "LangChain in Action: Develop LLM-Powered Applications":
        (27.99, "https://img-c.udemycdn.com/course/750x422/5621170_d56e_2.jpg"),
    "FastAPI für Anfänger - Baue einen Twitter Clone mit FastAPI":
        (44.99, "https://img-c.udemycdn.com/course/750x422/5055186_4547_3.jpg"),
}

GRAPH = build_graph()

# ─────────────────────────── Lifespan ──────────────────────────────── #
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---------- Startup ----------
    init_db()
    with SessionLocal() as s:
        s.query(PromoCode).delete()
        s.query(Course).delete()
        s.commit()

        for title, (price, img) in IMAGE_MAP.items():
            s.add(
                Course(
                    title=title,
                    price=price,
                    image_url=img,
                    udemy_url="https://www.udemy.com",
                )
            )
        s.commit()

    yield

    # ---------- Shutdown ----------
    with SessionLocal() as s:
        s.query(PromoCode).delete()
        s.query(Course).delete()
        s.commit()

    _IP_LOG.clear()

app = FastAPI(title="Coding Crash Courses API", lifespan=lifespan)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")   # ✅

# ─────────────────────────── Helpers ───────────────────────────────── #
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
    now = datetime.utcnow()
    async with _LOCK:
        q = _IP_LOG.setdefault(ip, deque())
        while q and (now - q[0]) > timedelta(hours=1):
            q.popleft()

        hour_cnt = len(q)
        day_cnt  = len(q)           # >24 h removals handled by TTLCache

        if hour_cnt >= _LIMIT_HOUR or day_cnt >= _LIMIT_DAY:
            raise HTTPException(429, "Chat temporarily disabled: rate limit reached.")

        q.append(now)

def quota_snapshot(ip: str) -> dict:
    now = datetime.utcnow()
    q = _IP_LOG.get(ip, deque())
    while q and (now - q[0]) > timedelta(hours=1):
        q.popleft()

    hour_cnt = len(q)
    day_cnt  = len(q)
    return {
        "remaining_hour": max(0, _LIMIT_HOUR - hour_cnt),
        "remaining_day":  max(0, _LIMIT_DAY  - day_cnt),
        "allowed": hour_cnt < _LIMIT_HOUR and day_cnt < _LIMIT_DAY,
    }

# ─────────────────────────── API routes ────────────────────────────── #
@app.get("/courses", response_model=List[CourseOut])
def list_courses(db: Session = Depends(get_session)):
    now = datetime.utcnow()
    courses = db.query(Course).all()
    for c in courses:
        c.promo_codes = [p for p in c.promo_codes if p.expires_at > now]
    return courses

@app.post(
    "/courses/{cid}/promo",
    response_model=PromoCodeOut,
    dependencies=[Depends(basic_auth)],
)
def create_promo(
    cid: int,
    data: PromoCreate = Depends(),
    db: Session = Depends(get_session),
):
    course = db.get(Course, cid)
    if not course:
        raise HTTPException(404, "Course not found")
    promo = PromoCode(
        code=f"CCC-{cid}-{int(datetime.utcnow().timestamp())}",
        expires_at=datetime.utcnow() + timedelta(days=data.days_valid),
        course=course,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo

@app.delete(
    "/courses/{cid}/promo",
    status_code=204,
    dependencies=[Depends(basic_auth)],
)
def delete_promo(cid: int, db: Session = Depends(get_session)):
    promos = db.query(PromoCode).filter(PromoCode.course_id == cid).all()
    if not promos:
        raise HTTPException(404, "No active promo found")
    for p in promos:
        db.delete(p)
    db.commit()

# ────────────────────────── Chat endpoints ─────────────────────────── #
@app.get("/chat/status")
async def chat_status(request: Request):
    return quota_snapshot(_client_ip(request))

@app.post("/chat/thread")
def create_thread():
    return {"thread_id": str(uuid.uuid4())}

@app.post("/chat/{thread_id}", response_model=ChatResponse)
async def chat(thread_id: str, data: ChatRequest, request: Request):
    if len(data.message.split()) > 1000:
        raise HTTPException(413, "Input too long (≥1000 words).")

    ip = _client_ip(request)
    await check_ip_rate_limit(ip)

    result = await GRAPH.ainvoke(
        {"messages": [HumanMessage(content=data.message)]},
        config={"configurable": {"thread_id": thread_id}},
    )

    try:
        ai_msg = next(
            m for m in reversed(result["messages"]) if isinstance(m, AIMessage)
        )
    except StopIteration:
        raise HTTPException(500, "LLM returned no AIMessage")

    return ChatResponse(reply=ai_msg.content)
