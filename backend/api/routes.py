from collections.abc import Sequence
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import false, inspect
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import crud
from database import get_db
from dependencies import get_current_user, require_roles
from models import (
    Appointment,
    ConsultationBilling,
    Department,
    Doctor,
    LabTest,
    Medicine,
    Patient,
    PrescribedMedicine,
    PrescribedTest,
    Prescription,
    Staff,
    User,
)
from schema import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentUpdate,
    ConsultationBillingCreate,
    ConsultationBillingRead,
    ConsultationBillingUpdate,
    DepartmentCreate,
    DepartmentRead,
    DepartmentUpdate,
    DoctorCreate,
    DoctorRead,
    DoctorUpdate,
    LabTestCreate,
    LabTestRead,
    LabTestUpdate,
    MedicineCreate,
    MedicineRead,
    MedicineUpdate,
    PatientCreate,
    PatientRead,
    PatientUpdate,
    PrescribedMedicineCreate,
    PrescribedMedicineRead,
    PrescribedMedicineUpdate,
    PrescribedTestCreate,
    PrescribedTestRead,
    PrescribedTestUpdate,
    PrescriptionCreate,
    PrescriptionRead,
    PrescriptionUpdate,
    StaffCreate,
    StaffRead,
    StaffUpdate,
    UserCreate,
    UserRead,
    UserUpdate,
)


router = APIRouter()


def _deny_forbidden(message: str = "Insufficient permissions"):
    raise HTTPException(status_code=403, detail=message)


def _get_staff_department_id(db: Session, current_user) -> int | None:
    staff_id = getattr(current_user, "staff_id", None)
    if not staff_id:
        return None
    staff = crud.get_item_by_id(db, Staff, staff_id)
    if staff is None:
        return None
    return staff.dept_id


def _query_item_by_id(query, model: type, item_id: int):
    pk_name = inspect(model).primary_key[0].name
    return query.filter(getattr(model, pk_name) == item_id).first()


def _build_scoped_query(db: Session, model: type, current_user):
    role = getattr(current_user, "role", None)
    if role == "Admin":
        return db.query(model)

    if role == "Doctor":
        doctor_id = getattr(current_user, "doctor_id", None)
        if model is Patient:
            if not doctor_id:
                return db.query(Patient).filter(false())
            return (
                db.query(Patient)
                .join(Appointment, Appointment.patient_id == Patient.patient_id)
                .filter(Appointment.doctor_id == doctor_id)
                .distinct()
            )
        if model is Appointment:
            if not doctor_id:
                return db.query(Appointment).filter(false())
            return db.query(Appointment).filter(Appointment.doctor_id == doctor_id)
        if model is ConsultationBilling:
            if not doctor_id:
                return db.query(ConsultationBilling).filter(false())
            return (
                db.query(ConsultationBilling)
                .join(Appointment, ConsultationBilling.appointment_id == Appointment.appointment_id)
                .filter(Appointment.doctor_id == doctor_id)
            )
        if model is Prescription:
            if not doctor_id:
                return db.query(Prescription).filter(false())
            return (
                db.query(Prescription)
                .join(Appointment, Prescription.appointment_id == Appointment.appointment_id)
                .filter(Appointment.doctor_id == doctor_id)
            )
        if model is PrescribedMedicine:
            if not doctor_id:
                return db.query(PrescribedMedicine).filter(false())
            return (
                db.query(PrescribedMedicine)
                .join(Prescription, PrescribedMedicine.prescription_id == Prescription.prescription_id)
                .join(Appointment, Prescription.appointment_id == Appointment.appointment_id)
                .filter(Appointment.doctor_id == doctor_id)
            )
        if model is PrescribedTest:
            if not doctor_id:
                return db.query(PrescribedTest).filter(false())
            return (
                db.query(PrescribedTest)
                .join(Appointment, PrescribedTest.appointment_id == Appointment.appointment_id)
                .filter(Appointment.doctor_id == doctor_id)
            )
        if model in (Department, Doctor, Staff, LabTest, Medicine):
            return db.query(model)
        return db.query(model).filter(false())

    if role == "Staff":
        staff_dept_id = _get_staff_department_id(db, current_user)
        if model is Patient:
            if staff_dept_id is None:
                return db.query(Patient).filter(false())
            return (
                db.query(Patient)
                .join(Appointment, Appointment.patient_id == Patient.patient_id)
                .filter(Appointment.dept_id == staff_dept_id)
                .distinct()
            )
        if model is Appointment:
            if staff_dept_id is None:
                return db.query(Appointment).filter(false())
            return db.query(Appointment).filter(Appointment.dept_id == staff_dept_id)
        if model is ConsultationBilling:
            if staff_dept_id is None:
                return db.query(ConsultationBilling).filter(false())
            return (
                db.query(ConsultationBilling)
                .join(Appointment, ConsultationBilling.appointment_id == Appointment.appointment_id)
                .filter(Appointment.dept_id == staff_dept_id)
            )
        if model in (Department, Doctor, Staff, LabTest, Medicine):
            return db.query(model)
        return db.query(model).filter(false())

    return db.query(model).filter(false())


def _authorize_create(db: Session, model: type, payload: dict[str, Any], current_user):
    role = getattr(current_user, "role", None)
    if role == "Admin":
        return

    if model is Patient and role in ("Doctor", "Staff"):
        return

    if model is Appointment:
        if role == "Doctor":
            if not getattr(current_user, "doctor_id", None):
                _deny_forbidden("Doctor profile is not linked")
            if payload.get("doctor_id") != current_user.doctor_id:
                _deny_forbidden("Doctor can only create own appointments")
            return
        if role == "Staff":
            staff_dept_id = _get_staff_department_id(db, current_user)
            if staff_dept_id is None:
                _deny_forbidden("Staff profile is not linked to a department")
            if payload.get("dept_id") != staff_dept_id:
                _deny_forbidden("Staff can only create appointments in own department")
            return
        _deny_forbidden()

    if model in (ConsultationBilling, Prescription, PrescribedTest):
        appointment_id = payload.get("appointment_id")
        if appointment_id is None:
            raise HTTPException(status_code=400, detail="appointment_id is required")
        allowed_appointment = _query_item_by_id(
            _build_scoped_query(db, Appointment, current_user), Appointment, appointment_id
        )
        if allowed_appointment is None:
            _deny_forbidden("Record not in your allowed scope")
        return

    if model is PrescribedMedicine:
        prescription_id = payload.get("prescription_id")
        if prescription_id is None:
            raise HTTPException(status_code=400, detail="prescription_id is required")
        allowed_prescription = _query_item_by_id(
            _build_scoped_query(db, Prescription, current_user), Prescription, prescription_id
        )
        if allowed_prescription is None:
            _deny_forbidden("Record not in your allowed scope")
        return


def _authorize_update(db: Session, model: type, payload: dict[str, Any], current_user):
    role = getattr(current_user, "role", None)
    if role == "Admin":
        return

    if model is Appointment:
        if role == "Doctor" and "doctor_id" in payload and payload["doctor_id"] != current_user.doctor_id:
            _deny_forbidden("Doctor can only assign own doctor_id")
        if role == "Staff" and "dept_id" in payload:
            staff_dept_id = _get_staff_department_id(db, current_user)
            if payload["dept_id"] != staff_dept_id:
                _deny_forbidden("Staff can only assign own department")
        return

    if model in (ConsultationBilling, Prescription, PrescribedTest) and "appointment_id" in payload:
        appointment_id = payload["appointment_id"]
        allowed_appointment = _query_item_by_id(
            _build_scoped_query(db, Appointment, current_user), Appointment, appointment_id
        )
        if allowed_appointment is None:
            _deny_forbidden("Record not in your allowed scope")
        return

    if model is PrescribedMedicine and "prescription_id" in payload:
        prescription_id = payload["prescription_id"]
        allowed_prescription = _query_item_by_id(
            _build_scoped_query(db, Prescription, current_user), Prescription, prescription_id
        )
        if allowed_prescription is None:
            _deny_forbidden("Record not in your allowed scope")
        return


def _create_item(db: Session, model: type, payload: dict[str, Any]):
    try:
        return crud.create_item(db, model, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Constraint violation") from exc


def _update_item(db: Session, model: type, item_id: int, payload: dict[str, Any]):
    try:
        item = crud.update_item(db, model, item_id, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Constraint violation") from exc

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


def _delete_item(db: Session, model: type, item_id: int):
    deleted = crud.delete_item(db, model, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")


def register_crud_routes(
    *,
    model: type,
    create_schema: type,
    read_schema: type,
    update_schema: type,
    prefix: str,
    id_name: str,
    read_roles: Sequence[str] = ("Admin", "Doctor", "Staff"),
    write_roles: Sequence[str] = ("Admin",),
):
    entity_router = APIRouter(prefix=prefix, tags=[prefix.strip("/")])

    @entity_router.post(
        "/",
        response_model=read_schema,
        status_code=status.HTTP_201_CREATED,
        dependencies=[Depends(require_roles(*write_roles))],
    )
    def create_entity(
        payload: dict[str, Any],
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        validated = create_schema(**payload)
        data = validated.model_dump()
        _authorize_create(db, model, data, current_user)
        return _create_item(db, model, data)

    @entity_router.get(
        "/",
        response_model=list[read_schema],
        dependencies=[Depends(require_roles(*read_roles))],
    )
    def list_entities(
        skip: int = 0,
        limit: int = 100,
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        query = _build_scoped_query(db, model, current_user)
        return query.offset(skip).limit(limit).all()

    @entity_router.get(
        "/{" + id_name + "}",
        response_model=read_schema,
        dependencies=[Depends(require_roles(*read_roles))],
    )
    def get_entity(item_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
        item = _query_item_by_id(_build_scoped_query(db, model, current_user), model, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    @entity_router.put(
        "/{" + id_name + "}",
        response_model=read_schema,
        dependencies=[Depends(require_roles(*write_roles))],
    )
    def update_entity(
        payload: dict[str, Any],
        item_id: int,
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        validated = update_schema(**payload)
        data = validated.model_dump(exclude_unset=True)
        if not data:
            raise HTTPException(status_code=400, detail="No fields to update")
        item = _query_item_by_id(_build_scoped_query(db, model, current_user), model, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        _authorize_update(db, model, data, current_user)
        return _update_item(db, model, item_id, data)

    @entity_router.delete(
        "/{" + id_name + "}",
        status_code=status.HTTP_204_NO_CONTENT,
        dependencies=[Depends(require_roles(*write_roles))],
    )
    def delete_entity(item_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
        item = _query_item_by_id(_build_scoped_query(db, model, current_user), model, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        _delete_item(db, model, item_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    router.include_router(entity_router)


# Users are custom because password must always be hashed.
users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.post(
    "/",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user), Depends(require_roles("Admin"))],
)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_username(db, payload.user_name)
    if existing:
        raise HTTPException(status_code=400, detail="user_name already exists")
    return crud.create_user(db, payload.model_dump())


@users_router.get(
    "/",
    response_model=list[UserRead],
    dependencies=[Depends(get_current_user), Depends(require_roles("Admin"))],
)
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_items(db, User, skip, limit)


@users_router.get(
    "/{item_id}",
    response_model=UserRead,
    dependencies=[Depends(get_current_user), Depends(require_roles("Admin"))],
)
def get_user(item_id: int, db: Session = Depends(get_db)):
    user = crud.get_item_by_id(db, User, item_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return user


@users_router.put(
    "/{item_id}",
    response_model=UserRead,
    dependencies=[Depends(get_current_user), Depends(require_roles("Admin"))],
)
def update_user(item_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "user_name" in data:
        existing = crud.get_user_by_username(db, data["user_name"])
        if existing and existing.user_id != item_id:
            raise HTTPException(status_code=400, detail="user_name already exists")

    user = crud.update_user(db, item_id, data)
    if user is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return user


@users_router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_user), Depends(require_roles("Admin"))],
)
def delete_user(item_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_item(db, User, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


router.include_router(users_router)

register_crud_routes(
    model=Department,
    create_schema=DepartmentCreate,
    read_schema=DepartmentRead,
    update_schema=DepartmentUpdate,
    prefix="/departments",
    id_name="item_id",
)
register_crud_routes(
    model=Staff,
    create_schema=StaffCreate,
    read_schema=StaffRead,
    update_schema=StaffUpdate,
    prefix="/staff",
    id_name="item_id",
)
register_crud_routes(
    model=Doctor,
    create_schema=DoctorCreate,
    read_schema=DoctorRead,
    update_schema=DoctorUpdate,
    prefix="/doctors",
    id_name="item_id",
)
register_crud_routes(
    model=Patient,
    create_schema=PatientCreate,
    read_schema=PatientRead,
    update_schema=PatientUpdate,
    prefix="/patients",
    id_name="item_id",
    write_roles=("Admin", "Doctor", "Staff"),
)
register_crud_routes(
    model=Appointment,
    create_schema=AppointmentCreate,
    read_schema=AppointmentRead,
    update_schema=AppointmentUpdate,
    prefix="/appointments",
    id_name="item_id",
    write_roles=("Admin", "Doctor", "Staff"),
)
register_crud_routes(
    model=ConsultationBilling,
    create_schema=ConsultationBillingCreate,
    read_schema=ConsultationBillingRead,
    update_schema=ConsultationBillingUpdate,
    prefix="/consultation-billings",
    id_name="item_id",
    write_roles=("Admin", "Doctor", "Staff"),
)
register_crud_routes(
    model=Prescription,
    create_schema=PrescriptionCreate,
    read_schema=PrescriptionRead,
    update_schema=PrescriptionUpdate,
    prefix="/prescriptions",
    id_name="item_id",
    read_roles=("Admin", "Doctor"),
    write_roles=("Admin", "Doctor"),
)
register_crud_routes(
    model=Medicine,
    create_schema=MedicineCreate,
    read_schema=MedicineRead,
    update_schema=MedicineUpdate,
    prefix="/medicines",
    id_name="item_id",
)
register_crud_routes(
    model=PrescribedMedicine,
    create_schema=PrescribedMedicineCreate,
    read_schema=PrescribedMedicineRead,
    update_schema=PrescribedMedicineUpdate,
    prefix="/prescribed-medicines",
    id_name="item_id",
    read_roles=("Admin", "Doctor"),
    write_roles=("Admin", "Doctor"),
)
register_crud_routes(
    model=LabTest,
    create_schema=LabTestCreate,
    read_schema=LabTestRead,
    update_schema=LabTestUpdate,
    prefix="/lab-tests",
    id_name="item_id",
)
register_crud_routes(
    model=PrescribedTest,
    create_schema=PrescribedTestCreate,
    read_schema=PrescribedTestRead,
    update_schema=PrescribedTestUpdate,
    prefix="/prescribed-tests",
    id_name="item_id",
    read_roles=("Admin", "Doctor"),
    write_roles=("Admin", "Doctor"),
)
