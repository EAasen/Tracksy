# Issue: Standardize API Error Response Format

## Summary
Adopt a consistent JSON structure for errors and retrofit middleware to emit standardized shape.

## Tasks
- [ ] Decide canonical structure: `{ error: { code, message, details? } }`
- [ ] Update global error handler
- [ ] Update existing endpoints throwing errors
- [ ] Document error schema in OpenAPI and reference

## Acceptance Criteria
- All non-2xx responses use standardized structure
- OpenAPI references a single `Error` schema
