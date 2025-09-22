# ADR-0002: Route Storage & Geospatial Strategy

Status: Accepted  
Date: 2025-09-22  
Related Issues: #2 (Trail / Route Data Management), #1 (Auth foundation)  
Supersedes: None  
Superseded by: (future) PostGIS migration ADR (placeholder)

## Context
We are introducing a canonical `Route` entity (Issue #2) to support activity logging, analytics, and future recommendation features. We need to choose how to persist and query geospatial data early to avoid costly migrations.

Current stack (MVP): Node.js backend using MongoDB (already in use for other domain models). No existing operational PostgreSQL/PostGIS deployment in the project yet.

Geospatial requirements for MVP:
- Store user-created route line geometries (polylines)
- Compute approximate distance length
- Bounding box & name/tag filters for listing
- Basic intersection filtering (bbox query)

Deferred (future) advanced capabilities:
- Proximity / nearest route search
- Elevation-aware computations
- Route similarity / clustering
- Spatial joins and complex predicates

## Options Considered
### Option A: MongoDB + GeoJSON (2dsphere)
Pros:
- Zero additional infrastructure (Mongo already present)
- Rapid development with familiar driver
- Built-in 2dsphere indexes support basic spatial queries
- Simpler local development & tests
Cons:
- Limited advanced spatial operators vs PostGIS
- Distance accuracy for long polylines requires manual great-circle summation
- Complex future analytics may necessitate migration

### Option B: PostgreSQL + PostGIS (Immediate Adoption)
Pros:
- Rich spatial functions (ST_Length, ST_Simplify, ST_Intersects, etc.)
- Better performance for complex geospatial querying at scale
- Avoid future migration complexity
Cons:
- Introduces second database technology early
- More DevOps overhead (container, migrations, backups)
- Increased cognitive load for MVP timeline

### Option C: Hybrid (Write to Mongo, Async Mirror to PostGIS)
Pros:
- Begin building PostGIS-dependent features safely
- Keep core CRUD simple
Cons:
- Over-engineered for MVP
- Complexity in dual-write correctness and reconciliation

## Decision
Adopt Option A: MongoDB + GeoJSON for MVP (Phase 1A) with a clearly defined migration path to PostGIS once advanced spatial analytics becomes a near-term requirement (trigger: introduction of nearest-route or clustering feature OR route dataset > 50k entries).

## Rationale
- Keeps MVP velocity high; avoids premature infra complexity.
- Current feature set only needs basic line storage & bounding box search.
- Distances can be computed server-side using a lightweight Haversine accumulation.
- Allows us to validate domain usage & data volume before committing to PostGIS.

## Implications
Short Term:
- Implement `Route` schema in Mongo with 2dsphere index.
- Custom distance calculation logic (avoid reliance on limited operators).
- Tests rely solely on in-memory Mongo (mongodb-memory-server) for route features.

Medium Term:
- Abstract geometry operations in a utility module so migration to PostGIS is isolated.
- Monitor performance metrics: average route point count, query latencies.

Long Term Migration Path:
1. Introduce Postgres/PostGIS service & migrations.
2. Create parallel `routes_pg` table with equivalent fields.
3. Backfill from Mongo iteratively (batch export/import).
4. Dual-write for a transition period (feature flag).
5. Flip read path to PostGIS; retire Mongo route collection.

## Rejected Ideas
- Storing encoded polyline only (insufficient for spatial queries).
- Relying on external geospatial API for distance (adds latency & dependency risk).

## Security & Performance Considerations
- Enforce max coordinate count per route (configurable; start 5000) to prevent oversized payloads.
- Rate limit route creation per user.
- Ensure 2dsphere index present before enabling listing API in production.

## Open Questions
- Elevation gain: will require external DEM service; leave null until integrated.
- Soft delete vs hard delete: leaning soft delete for audit; confirm before implementation.

## Status Checkpoints
- [ ] Route schema merged
- [ ] Endpoints implemented
- [ ] Tests passing
- [ ] Metrics/logging added
- [ ] Documentation published (ROUTES_API.md)

## References
- MongoDB 2dsphere docs: https://www.mongodb.com/docs/manual/core/2dsphere/
- PostGIS documentation: https://postgis.net/documentation/
