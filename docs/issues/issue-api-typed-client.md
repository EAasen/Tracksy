# Issue: Generate Typed Client from OpenAPI

## Summary
Automate generation of a TypeScript (and optionally JS) client from the OpenAPI spec to reduce runtime errors and align frontend usage with server contracts.

## Tasks
- [ ] Add `openapi-typescript` dev dependency (root or backend)
- [ ] Add script: `spec:client` generating `frontend/src/api/types.ts`
- [ ] Decide on namespace vs modules style
- [ ] (Optional) Add fetch wrapper leveraging generated types
- [ ] Document regeneration step in README

## Acceptance Criteria
- Generated file builds without type errors
- At least one frontend component refactored to use generated types
