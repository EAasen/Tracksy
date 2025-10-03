# Issue: Implement /healthz Endpoint & Spec Entry

## Summary
Add lightweight health endpoint returning service status & basic env metadata; document in OpenAPI.

## Tasks
- [ ] Add GET `/api/v1/healthz`
- [ ] Response: `{ status: 'ok', uptime, timestamp }`
- [ ] Integrate Node process uptime
- [ ] Add to `openapi.yaml`
- [ ] (Optional) Distinguish degraded state if DB disconnected

## Acceptance Criteria
- Endpoint returns 200 in <100ms locally
- Included in spec and visible in Swagger UI
- Safe for unauthenticated access
