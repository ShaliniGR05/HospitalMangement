# RBAC API Route Test Results

## Summary

- Total checks: 186
- Success: 179
- Failure: 7

## Detailed Results

| Method | Route | Role | HTTP | Access Status | Notes |
|---|---|---|---:|---|---|
| GET | /health | Public | 200 | success | Public route reachable |
| POST | /auth/register | Public | 400 | success | Public route reachable |
| POST | /auth/login | Public | 401 | success | Public route reachable |
| GET | /auth/me | Admin | 200 | success | Access allowed |
| GET | /auth/me | Doctor | 200 | success | Access allowed |
| GET | /auth/me | Staff | 200 | success | Access allowed |
| POST | /users/ | Admin | 400 | success | Access allowed |
| POST | /users/ | Doctor | 403 | success | Correctly blocked |
| POST | /users/ | Staff | 403 | success | Correctly blocked |
| GET | /users/ | Admin | 200 | success | Access allowed |
| GET | /users/ | Doctor | 403 | success | Correctly blocked |
| GET | /users/ | Staff | 403 | success | Correctly blocked |
| GET | /users/{item_id} | Admin | 404 | success | Access allowed |
| GET | /users/{item_id} | Doctor | 403 | success | Correctly blocked |
| GET | /users/{item_id} | Staff | 403 | success | Correctly blocked |
| PUT | /users/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /users/{item_id} | Doctor | 403 | success | Correctly blocked |
| PUT | /users/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /users/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /users/{item_id} | Doctor | 403 | success | Correctly blocked |
| DELETE | /users/{item_id} | Staff | 403 | success | Correctly blocked |
| POST | /departments/ | Admin | 201 | success | Access allowed |
| POST | /departments/ | Doctor | 403 | success | Correctly blocked |
| POST | /departments/ | Staff | 403 | success | Correctly blocked |
| GET | /departments/ | Admin | 200 | success | Access allowed |
| GET | /departments/ | Doctor | 200 | success | Access allowed |
| GET | /departments/ | Staff | 200 | success | Access allowed |
| GET | /departments/{item_id} | Admin | 404 | success | Access allowed |
| GET | /departments/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /departments/{item_id} | Staff | 404 | success | Access allowed |
| PUT | /departments/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /departments/{item_id} | Doctor | 403 | success | Correctly blocked |
| PUT | /departments/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /departments/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /departments/{item_id} | Doctor | 403 | success | Correctly blocked |
| DELETE | /departments/{item_id} | Staff | 403 | success | Correctly blocked |
| POST | /staff/ | Admin | 201 | success | Access allowed |
| POST | /staff/ | Doctor | 403 | success | Correctly blocked |
| POST | /staff/ | Staff | 403 | success | Correctly blocked |
| GET | /staff/ | Admin | 200 | success | Access allowed |
| GET | /staff/ | Doctor | 200 | success | Access allowed |
| GET | /staff/ | Staff | 200 | success | Access allowed |
| GET | /staff/{item_id} | Admin | 404 | success | Access allowed |
| GET | /staff/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /staff/{item_id} | Staff | 404 | success | Access allowed |
| PUT | /staff/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /staff/{item_id} | Doctor | 403 | success | Correctly blocked |
| PUT | /staff/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /staff/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /staff/{item_id} | Doctor | 403 | success | Correctly blocked |
| DELETE | /staff/{item_id} | Staff | 403 | success | Correctly blocked |
| POST | /doctors/ | Admin | 400 | success | Access allowed |
| POST | /doctors/ | Doctor | 403 | success | Correctly blocked |
| POST | /doctors/ | Staff | 403 | success | Correctly blocked |
| GET | /doctors/ | Admin | 200 | success | Access allowed |
| GET | /doctors/ | Doctor | 200 | success | Access allowed |
| GET | /doctors/ | Staff | 200 | success | Access allowed |
| GET | /doctors/{item_id} | Admin | 404 | success | Access allowed |
| GET | /doctors/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /doctors/{item_id} | Staff | 404 | success | Access allowed |
| PUT | /doctors/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /doctors/{item_id} | Doctor | 403 | success | Correctly blocked |
| PUT | /doctors/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /doctors/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /doctors/{item_id} | Doctor | 403 | success | Correctly blocked |
| DELETE | /doctors/{item_id} | Staff | 403 | success | Correctly blocked |
| POST | /patients/ | Admin | 201 | success | Access allowed |
| POST | /patients/ | Doctor | 201 | success | Access allowed |
| POST | /patients/ | Staff | 201 | success | Access allowed |
| GET | /patients/ | Admin | 200 | success | Access allowed |
| GET | /patients/ | Doctor | 200 | success | Access allowed |
| GET | /patients/ | Staff | 200 | success | Access allowed |
| GET | /patients/{item_id} | Admin | 404 | success | Access allowed |
| GET | /patients/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /patients/{item_id} | Staff | 404 | success | Access allowed |
| PUT | /patients/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /patients/{item_id} | Doctor | 404 | success | Access allowed |
| PUT | /patients/{item_id} | Staff | 404 | success | Access allowed |
| DELETE | /patients/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /patients/{item_id} | Doctor | 404 | success | Access allowed |
| DELETE | /patients/{item_id} | Staff | 404 | success | Access allowed |
| POST | /appointments/ | Admin | 400 | success | Access allowed |
| POST | /appointments/ | Doctor | 403 | failure | Blocked by auth/role guard |
| POST | /appointments/ | Staff | 403 | failure | Blocked by auth/role guard |
| GET | /appointments/ | Admin | 200 | success | Access allowed |
| GET | /appointments/ | Doctor | 200 | success | Access allowed |
| GET | /appointments/ | Staff | 200 | success | Access allowed |
| GET | /appointments/{item_id} | Admin | 404 | success | Access allowed |
| GET | /appointments/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /appointments/{item_id} | Staff | 404 | success | Access allowed |
| PUT | /appointments/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /appointments/{item_id} | Doctor | 404 | success | Access allowed |
| PUT | /appointments/{item_id} | Staff | 404 | success | Access allowed |
| DELETE | /appointments/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /appointments/{item_id} | Doctor | 404 | success | Access allowed |
| DELETE | /appointments/{item_id} | Staff | 404 | success | Access allowed |
| POST | /consultation-billings/ | Admin | 400 | success | Access allowed |
| POST | /consultation-billings/ | Doctor | 403 | failure | Blocked by auth/role guard |
| POST | /consultation-billings/ | Staff | 403 | failure | Blocked by auth/role guard |
| GET | /consultation-billings/ | Admin | 200 | success | Access allowed |
| GET | /consultation-billings/ | Doctor | 200 | success | Access allowed |
| GET | /consultation-billings/ | Staff | 200 | success | Access allowed |
| GET | /consultation-billings/{item_id} | Admin | 404 | success | Access allowed |
| GET | /consultation-billings/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /consultation-billings/{item_id} | Staff | 404 | success | Access allowed |
| PUT | /consultation-billings/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /consultation-billings/{item_id} | Doctor | 404 | success | Access allowed |
| PUT | /consultation-billings/{item_id} | Staff | 404 | success | Access allowed |
| DELETE | /consultation-billings/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /consultation-billings/{item_id} | Doctor | 404 | success | Access allowed |
| DELETE | /consultation-billings/{item_id} | Staff | 404 | success | Access allowed |
| POST | /prescriptions/ | Admin | 400 | success | Access allowed |
| POST | /prescriptions/ | Doctor | 403 | failure | Blocked by auth/role guard |
| POST | /prescriptions/ | Staff | 403 | success | Correctly blocked |
| GET | /prescriptions/ | Admin | 200 | success | Access allowed |
| GET | /prescriptions/ | Doctor | 200 | success | Access allowed |
| GET | /prescriptions/ | Staff | 403 | success | Correctly blocked |
| GET | /prescriptions/{item_id} | Admin | 404 | success | Access allowed |
| GET | /prescriptions/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /prescriptions/{item_id} | Staff | 403 | success | Correctly blocked |
| PUT | /prescriptions/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /prescriptions/{item_id} | Doctor | 404 | success | Access allowed |
| PUT | /prescriptions/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /prescriptions/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /prescriptions/{item_id} | Doctor | 404 | success | Access allowed |
| DELETE | /prescriptions/{item_id} | Staff | 403 | success | Correctly blocked |
| POST | /medicines/ | Admin | 201 | success | Access allowed |
| POST | /medicines/ | Doctor | 403 | success | Correctly blocked |
| POST | /medicines/ | Staff | 403 | success | Correctly blocked |
| GET | /medicines/ | Admin | 200 | success | Access allowed |
| GET | /medicines/ | Doctor | 200 | success | Access allowed |
| GET | /medicines/ | Staff | 200 | success | Access allowed |
| GET | /medicines/{item_id} | Admin | 404 | success | Access allowed |
| GET | /medicines/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /medicines/{item_id} | Staff | 404 | success | Access allowed |
| PUT | /medicines/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /medicines/{item_id} | Doctor | 403 | success | Correctly blocked |
| PUT | /medicines/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /medicines/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /medicines/{item_id} | Doctor | 403 | success | Correctly blocked |
| DELETE | /medicines/{item_id} | Staff | 403 | success | Correctly blocked |
| POST | /prescribed-medicines/ | Admin | 400 | success | Access allowed |
| POST | /prescribed-medicines/ | Doctor | 403 | failure | Blocked by auth/role guard |
| POST | /prescribed-medicines/ | Staff | 403 | success | Correctly blocked |
| GET | /prescribed-medicines/ | Admin | 200 | success | Access allowed |
| GET | /prescribed-medicines/ | Doctor | 200 | success | Access allowed |
| GET | /prescribed-medicines/ | Staff | 403 | success | Correctly blocked |
| GET | /prescribed-medicines/{item_id} | Admin | 404 | success | Access allowed |
| GET | /prescribed-medicines/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /prescribed-medicines/{item_id} | Staff | 403 | success | Correctly blocked |
| PUT | /prescribed-medicines/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /prescribed-medicines/{item_id} | Doctor | 404 | success | Access allowed |
| PUT | /prescribed-medicines/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /prescribed-medicines/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /prescribed-medicines/{item_id} | Doctor | 404 | success | Access allowed |
| DELETE | /prescribed-medicines/{item_id} | Staff | 403 | success | Correctly blocked |
| POST | /lab-tests/ | Admin | 201 | success | Access allowed |
| POST | /lab-tests/ | Doctor | 403 | success | Correctly blocked |
| POST | /lab-tests/ | Staff | 403 | success | Correctly blocked |
| GET | /lab-tests/ | Admin | 200 | success | Access allowed |
| GET | /lab-tests/ | Doctor | 200 | success | Access allowed |
| GET | /lab-tests/ | Staff | 200 | success | Access allowed |
| GET | /lab-tests/{item_id} | Admin | 404 | success | Access allowed |
| GET | /lab-tests/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /lab-tests/{item_id} | Staff | 404 | success | Access allowed |
| PUT | /lab-tests/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /lab-tests/{item_id} | Doctor | 403 | success | Correctly blocked |
| PUT | /lab-tests/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /lab-tests/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /lab-tests/{item_id} | Doctor | 403 | success | Correctly blocked |
| DELETE | /lab-tests/{item_id} | Staff | 403 | success | Correctly blocked |
| POST | /prescribed-tests/ | Admin | 400 | success | Access allowed |
| POST | /prescribed-tests/ | Doctor | 403 | failure | Blocked by auth/role guard |
| POST | /prescribed-tests/ | Staff | 403 | success | Correctly blocked |
| GET | /prescribed-tests/ | Admin | 200 | success | Access allowed |
| GET | /prescribed-tests/ | Doctor | 200 | success | Access allowed |
| GET | /prescribed-tests/ | Staff | 403 | success | Correctly blocked |
| GET | /prescribed-tests/{item_id} | Admin | 404 | success | Access allowed |
| GET | /prescribed-tests/{item_id} | Doctor | 404 | success | Access allowed |
| GET | /prescribed-tests/{item_id} | Staff | 403 | success | Correctly blocked |
| PUT | /prescribed-tests/{item_id} | Admin | 404 | success | Access allowed |
| PUT | /prescribed-tests/{item_id} | Doctor | 404 | success | Access allowed |
| PUT | /prescribed-tests/{item_id} | Staff | 403 | success | Correctly blocked |
| DELETE | /prescribed-tests/{item_id} | Admin | 404 | success | Access allowed |
| DELETE | /prescribed-tests/{item_id} | Doctor | 404 | success | Access allowed |
| DELETE | /prescribed-tests/{item_id} | Staff | 403 | success | Correctly blocked |
