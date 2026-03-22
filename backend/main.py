from fastapi import FastAPI

from api.auth import router as auth_router
from api.routes import router as crud_router
from database import check_connection


app = FastAPI(title="HMS Backend API", version="1.0.0")

app.include_router(auth_router)
app.include_router(crud_router)


@app.get("/health", tags=["health"])
def health_check():
    try:
        check_connection()
        return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "degraded", "database": "disconnected"}
