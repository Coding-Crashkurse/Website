from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session

from langchain_core.messages import AIMessage, HumanMessage

from .database import init_db, SessionLocal, get_session
from .db_models import Course, PromoCode, Subscriber
from .schemas import CourseOut, PromoCodeOut, PromoCreate, SubscriberCreate
from .chat_graph import get_graph

app = FastAPI(title="Coding Crash Courses API")

# --------------------------------------------------------------------------- #
#  Auth – Basic
# --------------------------------------------------------------------------- #
security = HTTPBasic()
ADMIN_USER = "admin"
ADMIN_PASS = "changeme"


def basic_auth(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username != ADMIN_USER or credentials.password != ADMIN_PASS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Basic"},
        )


# --------------------------------------------------------------------------- #
#  Demo‑data (only first start) – REAL thumbnail URLs now
# --------------------------------------------------------------------------- #
@app.on_event("startup")
def startup() -> None:
    init_db()
    IMAGE_MAP: dict[str, tuple[float, str]] = {
        "LangGraph in Action: Develop Advanced AI Agents with LLMs": (
            54.99,
            "https://img-c.udemycdn.com/course/750x422/6359927_fb55_3.jpg",
        ),
        "Advanced LangChain Techniques: Mastering RAG Applications": (
            49.99,
            "https://img-c.udemycdn.com/course/750x422/6052857_31ba_3.jpg",
        ),
        "LangChain on Azure - Building Scalable LLM Applications": (
            34.99,
            "https://img-c.udemycdn.com/course/750x422/5734832_ba74.jpg",
        ),
        "LangChain in Action: Develop LLM‑Powered Applications": (
            27.99,
            "https://img-c.udemycdn.com/course/750x422/5621170_d56e_2.jpg",
        ),
        "FastAPI für Anfänger ‑ Baue einen Twitter Clone mit FastAPI": (
            44.99,
            "https://img-c.udemycdn.com/course/750x422/5055186_4547_3.jpg",
        ),
    }

    with SessionLocal() as s:
        for title, (price, img) in IMAGE_MAP.items():
            course = s.query(Course).filter_by(title=title).first()

            # 1) update old placeholder thumbnail
            if course and course.image_url.startswith("https://placehold.co"):
                course.image_url = img

            # 2) create row if it doesn’t exist yet
            if not course:
                s.add(
                    Course(
                        title=title,
                        price=price,
                        image_url=img,
                        udemy_url="https://www.udemy.com",  #  real URLs already set elsewhere
                    )
                )
        s.commit()


# --------------------------------------------------------------------------- #
#  Courses / Promo‑codes  (unchanged below)
# --------------------------------------------------------------------------- #
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
    for promo in promos:
        db.delete(promo)
    db.commit()


# --------------------------------------------------------------------------- #
#  Newsletter / Chat ‑‑ unchanged
# --------------------------------------------------------------------------- #
@app.post("/subscribe")
def subscribe(
    data: SubscriberCreate = Depends(),
    db: Session = Depends(get_session),
):
    if db.query(Subscriber).filter_by(email=data.email).first():
        return {"detail": "Already subscribed"}
    db.add(Subscriber(email=data.email))
    db.commit()
    return RedirectResponse("/", 303)


@app.post("/chat/thread")
def create_thread():
    return {"thread_id": str(uuid.uuid4())}


@app.post("/chat/{thread_id}")
def chat(thread_id: str, message: str):
    graph = get_graph(thread_id)
    result = graph.invoke(
        {"messages": [HumanMessage(content=message)]},
        config={"configurable": {"thread_id": thread_id}},
    )
    ai_msg = next(m for m in reversed(result["messages"]) if isinstance(m, AIMessage))
    return {"reply": ai_msg.content}
