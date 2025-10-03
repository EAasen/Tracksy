# Issue: Add x-changelog Extensions to OpenAPI

## Summary
Annotate operations and schemas with custom `x-changelog` metadata to drive future automated release notes.

## Tasks
- [ ] Define `x-changelog` structure (e.g., `{ introduced: "1.0.0", deprecated?: "date" }`)
- [ ] Add to initial critical endpoints
- [ ] Document policy for updating

## Acceptance Criteria
- Spectral ignores or warns (rule optional) but does not fail
- At least 3 endpoints annotated
