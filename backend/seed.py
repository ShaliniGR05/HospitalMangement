import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Department, Staff, Doctor, User, Patient, Appointment, ConsultationBilling, Prescription, Medicine, PrescribedMedicine, LabTest, PrescribedTest
from auth.password import hash_password
from datetime import date, time
from decimal import Decimal
import uuid

db = SessionLocal()

def seed():
    # Unique suffix to prevent unique constraint collisions (e.g. user_name)
    suffix = uuid.uuid4().hex[:4]
    
    print("Seeding Departments...")
    depts = []
    for i in range(1, 6):
        d = Department(dept_name=f"Dept {suffix} {i}")
        db.add(d)
        depts.append(d)
    db.commit()
    
    print("Seeding Medicines...")
    meds = []
    for i in range(1, 6):
        m = Medicine(medicine_name=f"Med {suffix} {i}", unit_price=Decimal("10.50") * i)
        db.add(m)
        meds.append(m)
    db.commit()
    
    print("Seeding LabTests...")
    tests = []
    for i in range(1, 6):
        t = LabTest(test_name=f"Test {suffix} {i}", standard_cost=Decimal("50.00") * i)
        db.add(t)
        tests.append(t)
    db.commit()
    
    print("Seeding Staff...")
    staffs = []
    for i in range(1, 6):
        s = Staff(
            staff_name=f"Staff {suffix} {i}",
            gender="M", phone=f"123456789{i}",
            dept_id=depts[i-1].dept_id,
            role="Doctor", salary=Decimal("5000"),
            joining_date=date(2023, 1, i)
        )
        db.add(s)
        staffs.append(s)
    db.commit()
    
    print("Seeding Doctors...")
    docs = []
    for i in range(1, 6):
        d = Doctor(
            staff_id=staffs[i-1].staff_id,
            specialization=f"Spec {suffix} {i}", qualification=f"Qual {suffix} {i}"
        )
        db.add(d)
        docs.append(d)
    db.commit()
    
    print("Seeding Users...")
    for i in range(1, 6):
        u = User(
            user_name=f"seed_doctor{suffix}_{i}",
            password=hash_password("password123"),
            role="Doctor",
            doctor_id=docs[i-1].doc_id,
        )
        db.add(u)
    db.commit()
    
    print("Seeding Patients...")
    patients = []
    for i in range(1, 6):
        p = Patient(
            patient_name=f"Patient {suffix} {i}", gender="F", age=25+i,
            phone_num=f"987654321{i}", blood_group="O+",
            registration_date=date(2023, 1, i)
        )
        db.add(p)
        patients.append(p)
    db.commit()
    
    print("Seeding Appointments...")
    apps = []
    for i in range(1, 6):
        a = Appointment(
            patient_id=patients[i-1].patient_id,
            doctor_id=docs[i-1].doc_id,
            dept_id=depts[i-1].dept_id,
            appointment_date=date(2023, 2, i),
            appointment_time=time(10, 0),
            status="completed"
        )
        db.add(a)
        apps.append(a)
    db.commit()
    
    print("Seeding Consultation Billings...")
    for i in range(1, 6):
        cb = ConsultationBilling(
            appointment_id=apps[i-1].appointment_id,
            amount=Decimal("150.00"),
            payment_status="paid", payment_date=date(2023, 2, i)
        )
        db.add(cb)
    db.commit()
    
    print("Seeding Prescriptions...")
    presc = []
    for i in range(1, 6):
        pr = Prescription(
            appointment_id=apps[i-1].appointment_id,
            prescribed_date=date(2023, 2, i)
        )
        db.add(pr)
        presc.append(pr)
    db.commit()
    
    print("Seeding Prescribed Medicines...")
    for i in range(1, 6):
        pm = PrescribedMedicine(
            prescription_id=presc[i-1].prescription_id,
            medicine_id=meds[i-1].medicine_id,
            dosage="1x daily", duration="5 days",
            quantity=5, unit_price=Decimal("10.50"), amount=Decimal("52.50")
        )
        db.add(pm)
    db.commit()
    
    print("Seeding Prescribed Tests...")
    for i in range(1, 6):
        pt = PrescribedTest(
            appointment_id=apps[i-1].appointment_id,
            test_id=tests[i-1].test_id,
            prescribed_date=date(2023, 2, i),
            result_date=date(2023, 2, i),
            result_time=time(14, 0),
            amount=Decimal("50.00"), status="paid"
        )
        db.add(pt)
    db.commit()
    
    print("Seed complete! Added 5 records to all tables successfully.")

if __name__ == "__main__":
    seed()
