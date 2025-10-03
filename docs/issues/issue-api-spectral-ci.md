# Issue: Add Spectral Lint CI for OpenAPI

## Summary
Introduce automated linting of the OpenAPI specification to catch structural or style regressions.

## Tasks
- [ ] Add `@stoplight/spectral-cli` as dev dependency (backend or root)
- [ ] Create GitHub Action `.github/workflows/api-spec-lint.yml`
- [ ] Command: `spectral lint backend/openapi.yaml`
- [ ] Fail on `error`, warn on `warn`
- [ ] Update `spec:lint` script in `backend/package.json`

## Acceptance Criteria
- Failing spec blocks PR merge (red workflow)
- Passing spec surfaces 0 errors

## Notes
Can extend rule set later for naming conventions.
