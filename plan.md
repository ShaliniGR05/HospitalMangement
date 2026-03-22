## Plan: FastAPI HMS Backend Foundation

Build a production-ready backend scaffold in the backend folder for your existing Neon PostgreSQL schema using FastAPI + SQLAlchemy, with JWT auth (60-minute access token) and bcrypt-only password storage. Implement full CRUD route groups for all listed tables with role-protected access and a clean modular structure so frontend integration can happen later without backend refactor.

**Steps**
1. Phase 1 - Project bootstrap and config (blocking)
2. Create backend runtime setup: dependency list, environment loading, and app config constants (database URL, JWT secret, algorithm, token expiry).
3. Implement database session management and connection health check in a dedicated module, configured for Neon SSL requirements.
4. Define role constants and auth settings aligned to current User role check (Doctor, Admin, Staff).
5. Phase 2 - ORM and schema layer (depends on Phase 1)
6. Build SQLAlchemy ORM models mapped to the already-created Neon tables, including quoted mapping for User and explicit table names for snake/capitalized DB tables.
7. Add relationship mappings only where useful for joins and response composition (Staff-Doctor, Appointment-Patient/Doctor, Prescription items/tests), avoiding aggressive eager loading.
8. Create Pydantic schemas for each resource with Create/Update/Read variants, and separate auth payload schemas (register/login/token/current user).
9. Phase 3 - Auth and authorization (depends on Phase 2)
10. Implement bcrypt helpers for hash and verify, enforcing bcrypt-only storage (no plaintext compatibility path).
11. Implement JWT token generation and validation with claims: sub=user_id, role, exp; set expiry to 60 minutes.
12. Create FastAPI dependencies: get_db, get_current_user, and role-guard dependency for admin-only write operations where needed.
13. Implement auth endpoints: register, login, and me using user_name + password login flow.
14. Phase 4 - CRUD service layer (parallel by domain after initial patterns are set)
15. Create CRUD functions per table in organized modules (or grouped sections) with consistent signatures and robust not-found/validation handling.
16. Enforce business checks for foreign keys and 1:1 constraints (Doctor.staff_id unique, Consultation_Billing.appointment_id unique).
17. Use transactional handling for multi-record operations (prescription with medicines/tests) to avoid partial writes.
18. Phase 5 - API routers and app composition (depends on Phases 3 and 4)
19. Implement route groups for all entities and mount in main app with predictable prefixes/tags.
20. Apply authorization matrix baseline: Admin full access; Doctor and Staff read access plus workflow-specific updates (appointments, prescriptions, tests) unless you later refine this matrix.
21. Add health endpoint and startup validation path (optional DB ping on startup with safe logging).
22. Phase 6 - Validation and hardening (depends on all previous phases)
23. Add request validation constraints (status enums, positive numeric amounts, date/time sanity checks).
24. Add error model consistency and API response patterns for auth errors, validation errors, and not-found cases.
25. Add basic test coverage for auth and at least one CRUD flow per major domain (patients, appointments, billing).

**Relevant files**
- d:/Sem_6/HMS/backend/.env - environment variables (DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES)
- d:/Sem_6/HMS/backend/database.py - engine, session factory, DB dependency, connection check
- d:/Sem_6/HMS/backend/models.py - ORM mappings for all existing Neon tables
- d:/Sem_6/HMS/backend/schema.py - Pydantic request/response schemas
- d:/Sem_6/HMS/backend/crud.py - reusable database operations
- d:/Sem_6/HMS/backend/main.py - FastAPI app, router includes, health endpoint
- d:/Sem_6/HMS/backend/auth/password.py - bcrypt hash/verify helpers
- d:/Sem_6/HMS/backend/auth/jwt_handler.py - JWT create/decode + token data schema
- d:/Sem_6/HMS/backend/api/auth.py - register/login/me routes
- d:/Sem_6/HMS/backend/api/* - CRUD routers by domain entity
- d:/Sem_6/HMS/backend/requirements.txt - dependency pinning for reproducible setup
- d:/Sem_6/HMS/backend/.gitignore - ensure .env and virtualenv are excluded

**Verification**
1. Environment/setup: create virtual env in backend, install dependencies, and confirm import health.
2. DB connectivity: run a connection test function and verify all expected tables are discoverable.
3. Auth verification: register a user, confirm password is stored hashed, login returns valid bearer token, and /auth/me resolves token correctly.
4. Authorization verification: confirm protected endpoints reject missing/invalid tokens and enforce role guards.
5. CRUD smoke tests: for each major table group, validate create/read/update/delete lifecycle with valid and invalid payloads.
6. Constraint checks: verify unique and FK conflict behavior returns controlled API errors (not raw DB traces).
7. Manual docs pass: run server and verify endpoint behavior via Swagger UI.

**Decisions**
- Login identifier: user_name + password.
- Auth token policy: access token only, 60-minute expiry.
- Password policy for this phase: bcrypt-only storage; reset existing plaintext accounts.
- Scope included now: full CRUD for all listed tables plus auth.
- Scope excluded now: frontend integration, CORS tuning, advanced refresh-token/session strategy.

**Further Considerations**
1. Recommended next decision after implementation: finalize a strict endpoint-by-endpoint role matrix (Admin/Doctor/Staff) to reduce over-permission risk.
2. Recommended near-term improvement: split large single-file crud/schema/modules into package-based domains once stable to keep maintainability high.
3. Recommended production hardening: add rate-limiting and login lockout policy after core API is validated.