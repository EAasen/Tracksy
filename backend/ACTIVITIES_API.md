# Activities API

Status: Draft (Issue #3)

## Overview
Records user activities (workouts/sessions) with optional association to a stored Route. Supports CRUD, listing with basic filters, and soft deletion. All endpoints require authentication.

## Model (Simplified)
- userId (owner)
- routeId (optional)
- type: run|hike|cycle|walk|swim|other
- startTime / endTime
- durationSeconds (derived if times change)
- distanceMeters (optional; falls back to route distance if provided and not supplied)
- calories (optional)
- notes (<= 2000 chars)
- metrics: { avgPace, avgHr, maxHr, elevationGainMeters }
- deletedAt (soft delete)

## Endpoints
### Create Activity
POST /activities
```json
{
  "type": "run",
  "routeId": "<optionalRouteId>",
  "startTime": "2025-09-22T08:00:00.000Z",
  "endTime": "2025-09-22T08:45:00.000Z",
  "distanceMeters": 5000,
  "notes": "Morning run"
}
```
Response 201:
```json
{ "id": "<activityId>", "durationSeconds": 2700 }
```
Errors: 400 VALIDATION_ERROR | 400 INVALID_TIME_RANGE | 400 INVALID_ROUTE | 403 FORBIDDEN_ROUTE

### Get Activity
GET /activities/{id}
Returns full activity if owner or admin. 403 if another user. 404 if deleted/nonexistent.

### List Activities
GET /activities?type=run&from=2025-09-20&to=2025-09-22&routeId=<id>&limit=20&cursor=<id>
Response:
```json
{ "items": [ { "_id": "...", "type": "run", ... } ], "nextCursor": null }
```
Pagination: uses backward pagination via `_id < cursor` if cursor provided.

### Update Activity
PUT /activities/{id}
```json
{ "distanceMeters": 5100, "metrics": { "avgPace": 295 } }
```
Recomputes duration if start/end changed.

### Delete Activity (Soft)
DELETE /activities/{id}
Response: `{ "id": "...", "deleted": true }`.

## Validation Rules
- startTime < endTime
- type required
- distanceMeters >= 0 (optional)
- metrics values non-negative
- notes length <= 2000
- routeId must exist & be accessible if provided

## Permissions
- CRUD restricted to owner (admin bypass allowed)
- Listing returns only the authenticated user’s activities (admin future enhancement)

## Error Examples
```json
{ "error": "INVALID_TIME_RANGE" }
{ "error": "VALIDATION_ERROR", "details": ["type is required"] }
{ "error": "FORBIDDEN_ROUTE" }
```

## Future Enhancements
- Public/shared activities
- Lap/split breakdown
- GPX auto-extraction -> activity creation
- Aggregated analytics endpoints
- Bulk import

## Example Curl
```
curl -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"type":"run","startTime":"2025-09-22T08:00:00.000Z","endTime":"2025-09-22T08:30:00.000Z"}' \
  https://api.example.com/activities
```
