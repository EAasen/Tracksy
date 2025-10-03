# Issue: Modularize OpenAPI Spec

## Summary
Split monolithic `openapi.yaml` into components for maintainability as endpoint surface grows.

## Tasks
- [ ] Create `backend/openapi/` directory
- [ ] Split into: `root.yaml`, `paths/*.yaml`, `components/schemas/*.yaml`
- [ ] Use `$ref` to assemble (with build script or `swagger-cli bundle`)
- [ ] Update docs & workflows to lint bundled output

## Acceptance Criteria
- Bundle process outputs valid spec identical (logically) to prior version
- CI lint uses bundled file
