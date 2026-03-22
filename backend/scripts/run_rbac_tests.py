from __future__ import annotations

from datetime import date, time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from fastapi.testclient import TestClient

from auth.jwt_handler import create_access_token
from main import app
from models import Appointment, Department, Doctor, LabTest, Medicine, Patient, Prescription, Staff, User
from database import SessionLocal


@dataclass
class Case:
    method: str
    path: str
    role: str
    expected_allowed: bool
    status_code: int
    access_status: str
    note: str


@dataclass
class FixtureContext:
    patient_id: int
    doctor_id: int
    staff_dept_id: int
    appointment_id: int
    prescription_id: int
    medicine_id: int
    test_id: int


def get_role_users() -> dict[str, User]:
    db = SessionLocal()
    try:
        users = db.query(User).all()
        role_users: dict[str, User] = {}
        for role in ("Admin", "Doctor", "Staff"):
            user = next((u for u in users if u.role == role), None)
            if user is not None:
                role_users[role] = user
        return role_users
    finally:
        db.close()


def build_headers(role_users: dict[str, User]) -> dict[str, dict[str, str]]:
    headers: dict[str, dict[str, str]] = {}
    for role, user in role_users.items():
        token = create_access_token(subject=str(user.user_id), role=role)
        headers[role] = {"Authorization": f"Bearer {token}"}
    return headers


def _first_or_none(items):
    return items[0] if items else None


def ensure_fixture_context(role_users: dict[str, User]) -> FixtureContext:
    db = SessionLocal()
    try:
        doctor_user = role_users.get("Doctor")
        staff_user = role_users.get("Staff")
        if doctor_user is None or staff_user is None:
            raise RuntimeError("Doctor and Staff users are required to run scoped RBAC checks")

        doctor_id = doctor_user.doctor_id
        if not doctor_id:
            first_doctor = db.query(Doctor).order_by(Doctor.doc_id.asc()).first()
            if not first_doctor:
                raise RuntimeError("No doctor record found to build RBAC fixtures")
            doctor_id = first_doctor.doc_id

        staff_dept_id: int | None = None
        if staff_user.staff_id:
            staff_row = db.query(Staff).filter(Staff.staff_id == staff_user.staff_id).first()
            if staff_row is not None:
                staff_dept_id = staff_row.dept_id
        if staff_dept_id is None:
            fallback_staff = db.query(Staff).filter(Staff.dept_id.isnot(None)).order_by(Staff.staff_id.asc()).first()
            staff_dept_id = fallback_staff.dept_id if fallback_staff else None
        if staff_dept_id is None:
            dept = Department(dept_name="RBAC_SCOPE_DEPT")
            db.add(dept)
            db.commit()
            db.refresh(dept)
            staff_dept_id = dept.dept_id

        patient = db.query(Patient).order_by(Patient.patient_id.asc()).first()
        if patient is None:
            patient = Patient(patient_name="RBAC_SCOPE_PATIENT")
            db.add(patient)
            db.commit()
            db.refresh(patient)

        appointment = (
            db.query(Appointment)
            .filter(Appointment.doctor_id == doctor_id, Appointment.dept_id == staff_dept_id)
            .order_by(Appointment.appointment_id.asc())
            .first()
        )
        if appointment is None:
            appointment = Appointment(
                patient_id=patient.patient_id,
                doctor_id=doctor_id,
                dept_id=staff_dept_id,
                appointment_date=date.today(),
                appointment_time=time(10, 0, 0),
                status="pending",
            )
            db.add(appointment)
            db.commit()
            db.refresh(appointment)

        prescription = (
            db.query(Prescription)
            .filter(Prescription.appointment_id == appointment.appointment_id)
            .order_by(Prescription.prescription_id.asc())
            .first()
        )
        if prescription is None:
            prescription = Prescription(appointment_id=appointment.appointment_id, prescribed_date=date.today())
            db.add(prescription)
            db.commit()
            db.refresh(prescription)

        medicine = db.query(Medicine).order_by(Medicine.medicine_id.asc()).first()
        if medicine is None:
            medicine = Medicine(medicine_name="RBAC_SCOPE_MEDICINE", unit_price=10.0)
            db.add(medicine)
            db.commit()
            db.refresh(medicine)

        test = db.query(LabTest).order_by(LabTest.test_id.asc()).first()
        if test is None:
            test = LabTest(test_name="RBAC_SCOPE_TEST", standard_cost=20.0)
            db.add(test)
            db.commit()
            db.refresh(test)

        return FixtureContext(
            patient_id=patient.patient_id,
            doctor_id=doctor_id,
            staff_dept_id=staff_dept_id,
            appointment_id=appointment.appointment_id,
            prescription_id=prescription.prescription_id,
            medicine_id=medicine.medicine_id,
            test_id=test.test_id,
        )
    finally:
        db.close()


def expected_roles_for_route(method: str, path: str) -> set[str] | None:
    # None => public route (no role requirement)
    if method == "GET" and path == "/health":
        return None
    if path in ("/auth/register", "/auth/login"):
        return None
    if method == "GET" and path == "/auth/me":
        return {"Admin", "Doctor", "Staff"}

    if path.startswith("/users"):
        return {"Admin"}

    prefix = path.split("/{")[0].rstrip("/")

    read_all = {"Admin", "Doctor", "Staff"}
    read_admin_doctor = {"Admin", "Doctor"}

    write_map: dict[str, set[str]] = {
        "/departments": {"Admin"},
        "/staff": {"Admin"},
        "/doctors": {"Admin"},
        "/patients": {"Admin", "Doctor", "Staff"},
        "/appointments": {"Admin", "Doctor", "Staff"},
        "/consultation-billings": {"Admin", "Doctor", "Staff"},
        "/prescriptions": {"Admin", "Doctor"},
        "/medicines": {"Admin"},
        "/prescribed-medicines": {"Admin", "Doctor"},
        "/lab-tests": {"Admin"},
        "/prescribed-tests": {"Admin", "Doctor"},
    }

    read_map: dict[str, set[str]] = {
        "/prescriptions": read_admin_doctor,
        "/prescribed-medicines": read_admin_doctor,
        "/prescribed-tests": read_admin_doctor,
    }

    if method in {"GET"}:
        return read_map.get(prefix, read_all)
    if method in {"POST", "PUT", "DELETE"}:
        return write_map.get(prefix, {"Admin"})
    return {"Admin", "Doctor", "Staff"}


def build_payloads(existing_admin_username: str, fx: FixtureContext) -> dict[tuple[str, str], dict[str, Any]]:
    long_text = "X" * 150
    safe_name = "RBAC_TEST"
    return {
        ("POST", "/auth/register"): {
            "user_name": existing_admin_username,
            "password": "Password@123",
            "role": "Staff",
        },
        ("POST", "/auth/login"): {"user_name": "invalid-user", "password": "invalid-pass"},
        ("POST", "/users/"): {
            "user_name": existing_admin_username,
            "password": "Password@123",
            "role": "Staff",
        },
        ("PUT", "/users/{item_id}"): {"role": "Admin"},
        ("POST", "/departments/"): {"dept_name": safe_name},
        ("PUT", "/departments/{item_id}"): {"dept_name": long_text},
        ("POST", "/staff/"): {"staff_name": safe_name},
        ("PUT", "/staff/{item_id}"): {"staff_name": long_text},
        ("POST", "/doctors/"): {"staff_id": 0},
        ("PUT", "/doctors/{item_id}"): {"staff_id": 0},
        ("POST", "/patients/"): {"patient_name": safe_name},
        ("PUT", "/patients/{item_id}"): {"patient_name": long_text},
        ("POST", "/appointments/"): {
            "patient_id": fx.patient_id,
            "doctor_id": fx.doctor_id,
            "dept_id": fx.staff_dept_id,
            "appointment_date": "2026-01-01",
            "appointment_time": "10:00:00",
            "status": "pending",
        },
        ("PUT", "/appointments/{item_id}"): {"doctor_id": 0},
        ("POST", "/consultation-billings/"): {"appointment_id": fx.appointment_id, "amount": 1.0},
        ("PUT", "/consultation-billings/{item_id}"): {"appointment_id": fx.appointment_id},
        ("POST", "/prescriptions/"): {"appointment_id": fx.appointment_id},
        ("PUT", "/prescriptions/{item_id}"): {"appointment_id": fx.appointment_id},
        ("POST", "/medicines/"): {"medicine_name": safe_name},
        ("PUT", "/medicines/{item_id}"): {"medicine_name": long_text},
        ("POST", "/prescribed-medicines/"): {"prescription_id": fx.prescription_id, "medicine_id": fx.medicine_id},
        ("PUT", "/prescribed-medicines/{item_id}"): {"prescription_id": fx.prescription_id},
        ("POST", "/lab-tests/"): {"test_name": safe_name},
        ("PUT", "/lab-tests/{item_id}"): {"test_name": long_text},
        ("POST", "/prescribed-tests/"): {"appointment_id": fx.appointment_id, "test_id": fx.test_id},
        ("PUT", "/prescribed-tests/{item_id}"): {"appointment_id": fx.appointment_id},
    }


def list_routes() -> list[tuple[str, str]]:
    items: list[tuple[str, str]] = [("GET", "/health"), ("POST", "/auth/register"), ("POST", "/auth/login"), ("GET", "/auth/me")]

    # Users
    items.extend(
        [
            ("POST", "/users/"),
            ("GET", "/users/"),
            ("GET", "/users/{item_id}"),
            ("PUT", "/users/{item_id}"),
            ("DELETE", "/users/{item_id}"),
        ]
    )

    entities = [
        "/departments",
        "/staff",
        "/doctors",
        "/patients",
        "/appointments",
        "/consultation-billings",
        "/prescriptions",
        "/medicines",
        "/prescribed-medicines",
        "/lab-tests",
        "/prescribed-tests",
    ]
    for prefix in entities:
        items.extend(
            [
                ("POST", f"{prefix}/"),
                ("GET", f"{prefix}/"),
                ("GET", f"{prefix}/{{item_id}}"),
                ("PUT", f"{prefix}/{{item_id}}"),
                ("DELETE", f"{prefix}/{{item_id}}"),
            ]
        )

    return items


def invoke(client: TestClient, method: str, path: str, headers: dict[str, str] | None, payload: dict[str, Any] | None) -> int:
    real_path = path.replace("{item_id}", "0")
    kwargs: dict[str, Any] = {}
    if headers:
        kwargs["headers"] = headers
    if payload is not None:
        kwargs["json"] = payload

    response = client.request(method, real_path, **kwargs)
    return response.status_code


def evaluate_access(expected_allowed: bool, status_code: int) -> tuple[str, str]:
    if expected_allowed:
        if status_code in (401, 403):
            return "failure", "Blocked by auth/role guard"
        return "success", "Access allowed"
    if status_code in (401, 403):
        return "success", "Correctly blocked"
    return "failure", "Should have been blocked but was not"


def evaluate_public_access(status_code: int) -> tuple[str, str]:
    # Public endpoints may still return 400/401 for invalid input/credentials.
    if status_code == 403:
        return "failure", "Unexpected role guard on public route"
    return "success", "Public route reachable"


def write_report(cases: list[Case], missing_roles: list[str], out_path: Path) -> None:
    lines: list[str] = []
    lines.append("# RBAC API Route Test Results")
    lines.append("")
    lines.append("## Summary")
    lines.append("")

    total = len(cases)
    success = sum(1 for c in cases if c.access_status == "success")
    failure = total - success
    lines.append(f"- Total checks: {total}")
    lines.append(f"- Success: {success}")
    lines.append(f"- Failure: {failure}")

    if missing_roles:
        lines.append(f"- Missing role users (not tested): {', '.join(missing_roles)}")

    lines.append("")
    lines.append("## Detailed Results")
    lines.append("")
    lines.append("| Method | Route | Role | HTTP | Access Status | Notes |")
    lines.append("|---|---|---|---:|---|---|")

    for c in cases:
        lines.append(
            f"| {c.method} | {c.path} | {c.role} | {c.status_code} | {c.access_status} | {c.note} |"
        )

    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    role_users = get_role_users()
    missing_roles = [r for r in ("Admin", "Doctor", "Staff") if r not in role_users]
    if "Admin" not in role_users:
        raise RuntimeError("No Admin user found in database; cannot run RBAC tests.")

    headers_by_role = build_headers(role_users)

    admin_username = role_users["Admin"].user_name
    fx = ensure_fixture_context(role_users)
    payloads = build_payloads(admin_username, fx)
    routes = list_routes()

    cases: list[Case] = []
    with TestClient(app, raise_server_exceptions=False) as client:
        # Public-only tests
        for method, path in routes:
            expected_roles = expected_roles_for_route(method, path)
            payload = payloads.get((method, path))
            if expected_roles is None:
                code = invoke(client, method, path, headers=None, payload=payload)
                access_status, note = evaluate_public_access(status_code=code)
                cases.append(
                    Case(
                        method=method,
                        path=path,
                        role="Public",
                        expected_allowed=True,
                        status_code=code,
                        access_status=access_status,
                        note=note,
                    )
                )
                continue

            for role in ("Admin", "Doctor", "Staff"):
                if role not in headers_by_role:
                    continue
                expected_allowed = role in expected_roles
                code = invoke(client, method, path, headers=headers_by_role[role], payload=payload)
                access_status, note = evaluate_access(expected_allowed=expected_allowed, status_code=code)
                cases.append(
                    Case(
                        method=method,
                        path=path,
                        role=role,
                        expected_allowed=expected_allowed,
                        status_code=code,
                        access_status=access_status,
                        note=note,
                    )
                )

    out_path = Path(__file__).resolve().parents[2] / "routes_result.md"
    write_report(cases, missing_roles, out_path)
    print(f"Wrote report: {out_path}")


if __name__ == "__main__":
    main()
