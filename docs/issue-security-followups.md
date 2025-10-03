# Issue: Security & Observability Follow-ups

## Summary
Post Issue #59 completion, several incremental improvements will enhance security posture, supply chain hygiene, runtime reliability, and performance insight. This issue tracks those optional but high-impact refinements.

## Rationale
These tasks reduce future toil (automated updates), surface regressions earlier (bundle stats, healthchecks), and prepare the platform for upcoming API versioning & scalability work.

## Scope
Focused on non-breaking enhancements; no API changes. All tasks are self-contained and can be completed independently.

## Tasks
- [ ] Backend health endpoint (`/healthz`) returning JSON: `{ status: 'ok', uptime, timestamp }`.
- [ ] Backend container HEALTHCHECK using curl hitting `/healthz`.
- [ ] README badges for: Security Audit workflow, Bundle Stats workflow, Dependabot.
- [ ] Configure size budget thresholds (initial advisory): main bundle warn at 450KB, error at 600KB (extend stats workflow to enforce error level).
- [ ] Add Spectral (OpenAPI linter) placeholder config (`.spectral.yaml`) for future API spec checks.
- [ ] Renovate evaluation note (decide keep Dependabot only or migrate) documented in `docs/dependency-management.md`.
- [ ] Optional: Add `npm run analyze` doc section in README with guidance on using uploaded stats.

## Out of Scope
- API versioning implementation (handled in Issue #61)
- Full performance budget automation (initial warning only here)
- Dependency major upgrades beyond currently pinned safe versions

## Acceptance Criteria
1. File changes implement all checked tasks without breaking existing Docker workflows.
2. New health endpoint returns HTTP 200 within <100ms locally with minimal logic.
3. Workflows remain green after changes.
4. Documentation updated (README badges + usage notes).
5. All new config files lint/parse without error (YAML/JSON where applicable).

## Risk & Mitigation
| Risk | Mitigation |
|------|------------|
| Healthcheck flakiness on cold start | Add `start_period` and sensible retry count |
| Bundle size variability | Use advisory thresholds first, fail only on extreme oversize |
| Tool overlap (Dependabot vs Renovate) | Document decision path before adding second tool |

## Metrics to Watch (Future)
- % of PRs auto-updated successfully
- Mean time to detect oversized bundle regressions
- Healthcheck success ratio across restarts

## Implementation Order (Suggested)
1. Health endpoint + Docker healthcheck (backend)
2. README badges
3. Bundle stats workflow enhancement (threshold logic)
4. Spectral config stub
5. Dependency management doc

## Linked
- Issue #59 (foundation) 
- Issue #61 (upcoming API versioning)
