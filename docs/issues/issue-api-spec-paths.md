# Issue: Flesh Out OpenAPI Paths & Schemas

## Summary
Populate `backend/openapi.yaml` with concrete paths for existing auth, user, and activity-related endpoints, adding reusable schemas and error responses.

## Tasks
- [ ] Inventory current Express routes (auth, users, activities if present)
- [ ] Add `components.schemas.User`, `AuthToken`, `Error` objects
- [ ] Define standard error structure `{ error: { code, message } }`
- [ ] Add security schemes: `bearerAuth` (JWT)
- [ ] Provide examples for at least login and profile retrieval
- [ ] Update `/api/openapi.yaml` and validate with Spectral (when lint added)

## Acceptance Criteria
- All documented endpoints render without errors in Swagger UI
- Shared schemas reused (no duplication of inline objects where practical)
- Security scheme applied to protected endpoints

## Risks
- Drift between implementation & spec — mitigate by adding CI lint later.

## Depends On
- Base spec introduced in API Versioning commit.
