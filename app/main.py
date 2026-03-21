from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base

# Import all models so they are registered with Base.metadata
from app.models import (  # noqa: F401
    department,
    user,
    staff,
    doctor,
    patient,
    appointment,
    consultation_billing,
    prescription,
    medicine,
    prescribed_medicine,
    lab_test,
    prescribed_test,
)

# Import routers
from app.routes import (
    auth,
    department as dept_route,
    staff as staff_route,
    doctor as doctor_route,
    patient as patient_route,
    appointment as appointment_route,
    consultation_billing as billing_route,
    prescription as prescription_route,
    medicine as medicine_route,
    lab_test as lab_test_route,
    prescribed_test as prescribed_test_route,
    prescribed_medicine as prescribed_medicine_route,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup on shutdown
    await engine.dispose()


app = FastAPI(
    title="Hospital Management System API",
    description="A comprehensive REST API for managing hospital operations including patients, doctors, appointments, billing, prescriptions, and lab tests.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(dept_route.router)
app.include_router(staff_route.router)
app.include_router(doctor_route.router)
app.include_router(patient_route.router)
app.include_router(appointment_route.router)
app.include_router(billing_route.router)
app.include_router(prescription_route.router)
app.include_router(medicine_route.router)
app.include_router(prescribed_medicine_route.router)
app.include_router(lab_test_route.router)
app.include_router(prescribed_test_route.router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to the Hospital Management System API",
        "docs": "/docs",
        "redoc": "/redoc",
    }
