# Issue: Add Header-Based API Version Negotiation

## Summary
Introduce optional `Accept: application/vnd.tracksy.v1+json` style negotiation while keeping URL versioning.

## Tasks
- [ ] Parse custom media type in a middleware
- [ ] Override default version when header present
- [ ] Add warning header if mismatch between URL + header
- [ ] Document usage in README & OpenAPI description

## Acceptance Criteria
- Requests with header served normally
- Invalid / unsupported version returns 400 with error schema
