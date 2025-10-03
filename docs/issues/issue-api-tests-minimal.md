# Issue: Add Minimal API Versioning & Docs Tests

## Summary
Introduce light test coverage to prevent regressions for version header and docs endpoints.

## Tasks
- [ ] Add test framework usage (mocha + chai already present)
- [ ] Test `/api/v1` root returns 200 (or appropriate JSON)
- [ ] Test `API-Version` header present
- [ ] Test `/api/openapi.yaml` returns valid YAML parse
- [ ] (Optional) Snapshot main sections of spec

## Acceptance Criteria
- All tests pass locally & in CI
- Failure meaningfully indicates missing header or invalid spec
