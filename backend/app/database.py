import os
from sqlmodel import SQLModel, Session, create_engine

# z. B.  postgresql://user:pass@postgres:5432/vectordb
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL env variable fehlt")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def init_db() -> None:
    """Erzeugt alle Tabellen, falls nötig."""
    SQLModel.metadata.create_all(bind=engine)


# FastAPI-Dependency  → liefert *SQLModel.Session*
def get_session():
    with Session(engine) as session:
        yield session
