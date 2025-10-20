# ADR-0003: Database Documentation Consistency Fix

**Status:** Accepted  
**Date:** 2024-01-20  
**Context:** Issue #58 - Database Architecture Consistency

## Context

During Phase 1A execution, a critical inconsistency was discovered between the project's documentation and actual implementation regarding the database technology stack:

**Documentation References:**
- Original `README.md` listed `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` environment variables
- Original `ROADMAP.md` stated "PostgreSQL + PostGIS" as the MVP stack
- Original `shared/env/.env.example` used `DATABASE_URL=postgres://user:password@localhost:5432/tracksy`
- Original `github_issues_template.md` referenced PostgreSQL in multiple template issues

**Actual Implementation:**
- `backend/config/database.js` uses Mongoose with MongoDB connection
- `docker/docker-compose.yml` correctly configured with `mongo:7.0` service
- All schemas (User, HealthMetrics, ActivityLog) use Mongoose ODM
- ADR-0002 documented MongoDB + GeoJSON as the chosen MVP approach

**Impact:**
- Confusion for new developers
- Potential deployment failures when following documentation
- Risk of incorrect infrastructure provisioning

## Decision

**Align all documentation to reflect MongoDB as the MVP database technology**, as established in ADR-0002.

### Rationale

1. **Implementation is Correct:** The codebase already uses MongoDB with Mongoose, and ADR-0002 clearly documents this architectural decision with sound reasoning (MVP velocity, developer familiarity, clear migration path).

2. **Documentation Drift:** The PostgreSQL references in documentation were outdated and did not reflect the actual architectural decision.

3. **Consistency is Critical:** For Phase 1A deployment readiness, documentation must accurately reflect the implementation.

### Changes Made

#### Files Updated to MongoDB:

1. **`shared/env/.env.example`**
   - Changed: `DATABASE_URL=postgres://user:password@localhost:5432/tracksy`
   - To: `DATABASE_URL=mongodb://localhost:27017/tracksy`
   - Added: Comments for Docker and production configurations

2. **`README.md`**
   - Removed: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` environment variables
   - Added: `DATABASE_URL` with MongoDB connection string examples for local, Docker, and production environments
   - Updated: Prerequisites section to clarify MongoDB for MVP

3. **`ROADMAP.md`**
   - Updated: Technical Architecture section to show "MongoDB + GeoJSON (PostGIS migration planned)"
   - Updated: Backend Stack to specify MongoDB with 2dsphere indexes
   - Added: References to ADR-0002 explaining the architecture decision
   - Updated: MVP-First Approach section to list MongoDB instead of PostgreSQL

4. **`github_issues_template.md`**
   - Updated: Issue #1 template (Authentication) to reference MongoDB
   - Updated: Issue #2 template (Trail/Route Data) to reference "MongoDB with GeoJSON for spatial data (MVP - see ADR-0002)"
   - Updated: Docker deployment template to reference MongoDB container

#### Files Confirmed Correct:

1. **`docker/docker-compose.yml`** - Already correctly configured with `mongo:7.0`
2. **`backend/config/database.js`** - Already using Mongoose with MongoDB
3. **`docs/adr/ADR-0002-route-storage-decision.md`** - Correctly documents MongoDB choice

## Consequences

### Positive

✅ **Documentation Accuracy:** All documentation now accurately reflects the implemented architecture  
✅ **Developer Onboarding:** New developers will not be confused by inconsistent database references  
✅ **Deployment Confidence:** Infrastructure provisioning can proceed with confidence using correct database technology  
✅ **ADR Alignment:** Documentation now aligns with ADR-0002 architectural decisions  
✅ **Future Migration Path:** Documentation clearly states migration to PostgreSQL + PostGIS is planned for Phase 3

### Neutral

📋 **Migration Path Documented:** References to future PostgreSQL + PostGIS migration remain in appropriate contexts (ROADMAP.md technical evolution sections)

### Negative

None - this change only aligns documentation with existing implementation.

## Validation

### Testing Performed
- [x] Verified all PostgreSQL references in documentation
- [x] Confirmed remaining PostgreSQL references are appropriate (future migration plans, ADR-0002 context)
- [x] Verified Docker Compose configuration uses MongoDB correctly
- [x] Confirmed backend code uses Mongoose/MongoDB throughout

### Remaining PostgreSQL References (Appropriate)
- `ROADMAP.md`: Future migration to PostgreSQL + PostGIS (Phase 3 evolution)
- `docs/adr/ADR-0002-route-storage-decision.md`: Architectural decision context
- `docs/GITHUB_ISSUES_ORGANIZATION.md`: Reference to this issue (#58)

## Related

- **Issue #58:** Database Architecture Consistency (MongoDB/PostgreSQL mismatch) - RESOLVED
- **ADR-0002:** Route Storage & Geospatial Strategy Decision - MongoDB for MVP, PostGIS migration planned
- **Phase 1A Milestone:** Critical infrastructure fix for deployment readiness

## Notes

This ADR documents a **correction** rather than a new architectural decision. The architecture (MongoDB for MVP) was correctly chosen and implemented per ADR-0002. This ADR records the remediation of documentation that did not reflect that decision.
