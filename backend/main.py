from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.auth import router as auth_router
from api.routes import router as crud_router
from config import settings
from database import check_connection


app = FastAPI(title="HMS Backend API", version="1.0.0")


def _parse_origins(raw_origins: str) -> list[str]:
    origins = []
    for origin in raw_origins.split(","):
        normalized = origin.strip().rstrip("/")
        if normalized:
            origins.append(normalized)
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_origins(settings.frontend_origins),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(crud_router)


@app.get("/health", tags=["health"])
def health_check():
    try:
        check_connection()
        return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "degraded", "database": "disconnected"}
