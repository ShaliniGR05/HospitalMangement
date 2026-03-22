# HMS API Routes And RBAC (Short)

## Auth And Health

| Method | Route | Output (logical) | Access |
|---|---|---|---|
| GET | /health | Service and DB status (`status`, `database`) | Public |
| POST | /auth/register | Created user profile (`user_id`, `user_name`, `role`, optional links) | Public |
| POST | /auth/login | JWT token (`access_token`, `token_type`) | Public |
| GET | /auth/me | Current authenticated user profile | Any logged-in user |

## User Management

| Method | Route | Output (logical) | Access |
|---|---|---|---|
| POST | /users/ | Created user | Admin only |
| GET | /users/ | User list | Admin only |
| GET | /users/{item_id} | One user | Admin only |
| PUT | /users/{item_id} | Updated user | Admin only |
| DELETE | /users/{item_id} | No content (204) | Admin only |

## Generated CRUD Routes (Per Entity)

Each entity below has:
- `POST /<entity>/`
- `GET /<entity>/`
- `GET /<entity>/{item_id}`
- `PUT /<entity>/{item_id}`
- `DELETE /<entity>/{item_id}`

### Entity Matrix

| Entity | Create / Update / Delete | Read (List/Get) | Scope Rule |
|---|---|---|---|
| departments | Admin | Admin, Doctor, Staff | No extra ownership filter |
| staff | Admin | Admin, Doctor, Staff | No extra ownership filter |
| doctors | Admin | Admin, Doctor, Staff | No extra ownership filter |
| medicines | Admin | Admin, Doctor, Staff | No extra ownership filter |
| lab-tests | Admin | Admin, Doctor, Staff | No extra ownership filter |
| patients | Admin, Doctor, Staff | Admin, Doctor, Staff | Doctor: only patients linked to own appointments. Staff: only patients linked to appointments in own department (via `appointment.dept_id`). |
| appointments | Admin, Doctor, Staff | Admin, Doctor, Staff | Doctor: own `doctor_id` only. Staff: own department (`dept_id`) only. |
| consultation-billings | Admin, Doctor, Staff | Admin, Doctor, Staff | Must belong to appointment in caller's allowed scope. |
| prescriptions | Admin, Doctor | Admin, Doctor | Must belong to appointment owned by doctor (or admin). |
| prescribed-medicines | Admin, Doctor | Admin, Doctor | Must belong to prescription linked to doctor's appointment (or admin). |
| prescribed-tests | Admin, Doctor | Admin, Doctor | Must belong to appointment owned by doctor (or admin). |

## Response Shape (Logical)

- `POST` returns created record as entity schema.
- `GET list` returns array of entity schema records.
- `GET by id` returns one entity schema record.
- `PUT` returns updated entity schema record.
- `DELETE` returns `204 No Content`.

## Error Behavior

- `401`: missing/invalid token.
- `403`: role not allowed or profile/scope violation (for example, doctor trying another doctor's record).
- `404`: record not found (or not visible in scoped queries).
- `400`: validation problems, empty update payload, or DB constraint violation.

## Notes

- Ownership mapping uses user links: `User.doctor_id`, `User.staff_id`.
- Staff department scope is based on `Appointment.dept_id` (as requested, not in `Patient`).
