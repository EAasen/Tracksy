# Routes API

Status: Draft (Issue #2)

## Overview
Provides CRUD & listing for user-created trail/route geometries. All endpoints require authentication (Bearer access token). Private routes are only visible to their creator or admins.

## Endpoints
### Create Route
POST /routes
```json
{
  "name": "Lakeside Loop",
  "description": "Scenic loop",
  "visibility": "public",
  "tags": ["loop","lake"],
  "geojson": { "type": "LineString", "coordinates": [[10.0,59.0],[10.001,59.001],[10.002,59.002]] }
}
```
Response 201:
```json
{ "id": "<routeId>", "name": "Lakeside Loop", "distanceMeters": 532.4, "visibility": "public" }
```
Errors: 400 VALIDATION_ERROR | ROUTE_TOO_SHORT

### Get Route
GET /routes/{id}
Response 200: Full route document (including geometry) if authorized.
Errors: 404 NOT_FOUND | 403 FORBIDDEN

### List Routes
GET /routes?q=loop&bbox=minLon,minLat,maxLon,maxLat&tags=loop,lake&visibility=public&mine=true&limit=20
Response 200:
```json
{ "items": [ { "_id": "..", "name": "...", "visibility": "public", ... } ], "count": 1 }
```
Notes:
- bbox filters routes whose geometry intersects the box.
- mine=true restricts to routes created by current user.
- Without filters, returns user-owned + public routes.

### Update Route
PUT /routes/{id}
```json
{ "name": "New Name", "tags": ["forest"], "geojson": { "type": "LineString", "coordinates": [[10,59],[10.01,59.01]] } }
```
Recomputes distance/bbox/center if geometry provided.
Errors: 404 NOT_FOUND | 403 FORBIDDEN | 400 VALIDATION_ERROR | 400 ROUTE_TOO_SHORT

### Delete Route (Soft)
DELETE /routes/{id}
Response 200: `{ "id": "...", "deleted": true }`
Subsequent fetch returns 404.

## Validation Constraints
- name: 3–120 chars
- description: <= 2000 chars
- tags: <= 10, each <= 32 chars (normalized lowercase)
- coordinates: 2–5000 points
- distance computed must be >= 1 meter

## Geospatial Notes
- Stored as GeoJSON LineString with 2dsphere index.
- distanceMeters computed via Haversine accumulation.
- bbox & center cached for quick display.

## Permissions
- Create: any authenticated user
- Read private: owner or admin
- List: shows (public OR owned) unless visibility query narrows scope
- Update/Delete: owner or admin

## Error Formats
```json
{ "error": "VALIDATION_ERROR", "details": ["name is required"] }
{ "error": "FORBIDDEN" }
{ "error": "NOT_FOUND" }
```

## Future Enhancements (Not in MVP)
- Elevation gain calculation
- Simplified geometry endpoint
- Public unauthenticated browse (read-only)
- Route version history
- GPX file upload ingestion
- Nearest route / similarity search

## Example Curl
```
curl -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Test","geojson":{"type":"LineString","coordinates":[[10,59],[10.01,59.01]]}}' \
  https://api.example.com/routes
```
