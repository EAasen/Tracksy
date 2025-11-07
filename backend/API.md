# Tracksy API Documentation

## API Versioning

The Tracksy API uses URL-based versioning to ensure backward compatibility and smooth evolution of the API.

### Current Version: v1

**Base URL:** `/api/v1`

All new integrations should use the versioned endpoints. Legacy endpoints (without `/api/v1` prefix) are maintained for backward compatibility but will be deprecated in future versions.

## Authentication

Most API endpoints require authentication using JWT (JSON Web Token). Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

### Token Lifecycle

- **Access Token:** Valid for 15 minutes
- **Refresh Token:** Valid for 30 days
- Use `/api/v1/auth/token/refresh` to obtain a new access token

## API Endpoints

### Authentication & User Management

#### POST `/api/v1/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-30 alphanumeric)",
  "password": "string (8-100 chars)",
  "email": "string (valid email)",
  "role": "string (optional: 'user' or 'admin')"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created. Please verify your email.",
  "accessToken": "string",
  "refreshToken": "string",
  "emailVerificationToken": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "emailVerified": false
  }
}
```

**Error Codes:**
- `400` - Validation error
- `409` - Username or email already exists (DUPLICATE_USER)

---

#### POST `/api/v1/auth/login`
Authenticate and receive access tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "emailVerified": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```

**Error Codes:**
- `400` - Validation error
- `401` - Invalid credentials (INVALID_CREDENTIALS)

---

#### POST `/api/v1/auth/token/refresh`
Refresh an expired access token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "string"
}
```

**Error Codes:**
- `400` - Missing refresh token
- `401` - Invalid or expired refresh token

---

#### POST `/api/v1/auth/logout`
Invalidate a refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

#### POST `/api/v1/auth/password-recovery`
Request a password reset token.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "If an account with that email exists, a password reset link has been sent",
  "resetToken": "string"
}
```

**Note:** In production, the token should be sent via email instead of in the response.

---

#### POST `/api/v1/auth/password-reset`
Reset password using a token.

**Request Body:**
```json
{
  "token": "string",
  "password": "string (min 8 chars)"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

**Error Codes:**
- `400` - Invalid or expired token

---

#### POST `/api/v1/auth/verify-email`
Verify email address.

**Request Body:**
```json
{
  "token": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Email verified successfully"
}
```

**Error Codes:**
- `400` - Invalid or expired verification token

---

### Activities

#### GET `/api/v1/activities`
List user's activities with filtering and pagination.

**Authentication:** Required

**Query Parameters:**
- `type` - Filter by activity type (walk, run, bike, hike, swim, ski, other)
- `from` - Filter activities starting from this date (ISO 8601)
- `to` - Filter activities up to this date (ISO 8601)
- `routeId` - Filter by associated route ID
- `limit` - Number of results (default: 20, max: 100)
- `cursor` - Cursor for pagination (activity ID)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "_id": "string",
      "userId": "string",
      "type": "run",
      "startTime": "2025-10-31T10:00:00Z",
      "endTime": "2025-10-31T11:00:00Z",
      "durationSeconds": 3600,
      "distanceMeters": 10000,
      "calories": 500,
      "notes": "Morning run",
      "metrics": {
        "avgHeartRate": 145,
        "maxHeartRate": 165,
        "avgPace": 360,
        "elevationGainMeters": 100
      },
      "routeId": {
        "name": "Park Loop",
        "description": "..."
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": "string or null",
    "hasMore": true
  }
}
```

---

#### GET `/api/v1/activities/:id`
Get a specific activity by ID.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "data": {
    "_id": "string",
    "userId": "string",
    "type": "run",
    "startTime": "2025-10-31T10:00:00Z",
    "endTime": "2025-10-31T11:00:00Z",
    "durationSeconds": 3600,
    "distanceMeters": 10000,
    "calories": 500,
    "notes": "Morning run",
    "metrics": { ... }
  }
}
```

**Error Codes:**
- `404` - Activity not found
- `403` - Access forbidden (not your activity)

---

#### POST `/api/v1/activities`
Create a new activity.

**Authentication:** Required

**Request Body:**
```json
{
  "type": "run|walk|bike|hike|swim|ski|other",
  "startTime": "2025-10-31T10:00:00Z",
  "endTime": "2025-10-31T11:00:00Z",
  "routeId": "string (optional)",
  "distanceMeters": 10000,
  "calories": 500,
  "notes": "Morning run",
  "metrics": {
    "avgHeartRate": 145,
    "maxHeartRate": 165,
    "avgPace": 360,
    "elevationGainMeters": 100
  }
}
```

**Response:** `201 Created`
```json
{
  "message": "Activity created successfully",
  "data": {
    "id": "string",
    "type": "run",
    "durationSeconds": 3600,
    "startTime": "2025-10-31T10:00:00Z",
    "endTime": "2025-10-31T11:00:00Z"
  }
}
```

**Error Codes:**
- `400` - Validation error, invalid time range, or invalid route
- `403` - Route access forbidden

---

#### PUT `/api/v1/activities/:id`
Update an existing activity.

**Authentication:** Required

**Request Body:** (All fields optional)
```json
{
  "type": "run|walk|bike|hike|swim|ski|other",
  "startTime": "2025-10-31T10:00:00Z",
  "endTime": "2025-10-31T11:00:00Z",
  "routeId": "string or null",
  "distanceMeters": 10000,
  "calories": 500,
  "notes": "Updated notes",
  "metrics": { ... }
}
```

**Response:** `200 OK`
```json
{
  "message": "Activity updated successfully",
  "data": {
    "id": "string",
    "updated": true
  }
}
```

**Error Codes:**
- `404` - Activity not found
- `403` - Access forbidden
- `400` - Validation error

---

#### DELETE `/api/v1/activities/:id`
Soft delete an activity.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Activity deleted successfully",
  "data": {
    "id": "string",
    "deleted": true
  }
}
```

**Error Codes:**
- `404` - Activity not found
- `403` - Access forbidden

---

### Health Metrics

#### GET `/api/v1/health-metrics`
List user's health metrics with pagination.

**Authentication:** Required

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10, max: 100)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "_id": "string",
      "userId": "string",
      "date": "2025-10-31T00:00:00Z",
      "weight": 70.5,
      "heartRate": 72,
      "bloodPressure": {
        "systolic": 120,
        "diastolic": 80
      },
      "sleepHours": 7.5,
      "steps": 10000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

#### GET `/api/v1/health-metrics/:id`
Get a specific health metric.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "data": {
    "_id": "string",
    "userId": "string",
    "date": "2025-10-31T00:00:00Z",
    "weight": 70.5,
    ...
  }
}
```

**Error Codes:**
- `404` - Health metric not found

---

#### POST `/api/v1/health-metrics`
Create a new health metric entry.

**Authentication:** Required

**Request Body:**
```json
{
  "date": "2025-10-31T00:00:00Z",
  "weight": 70.5,
  "heartRate": 72,
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "sleepHours": 7.5,
  "steps": 10000
}
```

**Response:** `201 Created`
```json
{
  "message": "Health metric created successfully",
  "data": { ... }
}
```

---

#### PUT `/api/v1/health-metrics/:id`
Update a health metric.

**Authentication:** Required

**Request Body:** (Fields to update)
```json
{
  "weight": 71.0,
  "steps": 12000
}
```

**Response:** `200 OK`
```json
{
  "message": "Health metric updated successfully",
  "data": { ... }
}
```

**Error Codes:**
- `404` - Health metric not found

---

#### DELETE `/api/v1/health-metrics/:id`
Soft delete a health metric.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Health metric deleted successfully"
}
```

---

### System Health

#### GET `/api/v1/health`
API health check endpoint.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-31T12:00:00Z"
}
```

---

#### GET `/healthz`
System health check (Docker-compatible).

**Response:** `200 OK` or `503 Service Unavailable`
```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T12:00:00Z",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "readyState": 1
  },
  "memory": {
    "rss": 50000000,
    "heapTotal": 20000000,
    "heapUsed": 15000000,
    "external": 1000000
  }
}
```

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "requestId": "uuid-v4",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_ID` | 400 | Invalid MongoDB ObjectId |
| `INVALID_TIME_RANGE` | 400 | End time before start time |
| `INVALID_ROUTE` | 400 | Route not found |
| `INVALID_CREDENTIALS` | 401 | Wrong username/password |
| `NO_TOKEN` | 401 | Authorization header missing |
| `INVALID_TOKEN` | 401 | JWT token invalid |
| `INVALID_TOKEN_FORMAT` | 401 | Authorization format invalid |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token invalid/expired |
| `NOT_AUTHENTICATED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `FORBIDDEN_ROUTE` | 403 | No access to route |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_USER` | 409 | Username/email exists |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General API:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 20 requests per 15 minutes per IP
- **Password reset:** 10 requests per 15 minutes per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Time when limit resets

## Pagination

### Cursor-Based Pagination (Activities)

Activities use cursor-based pagination for efficient traversal:

**Request:**
```
GET /api/v1/activities?limit=20&cursor=507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "nextCursor": "507f1f77bcf86cd799439012",
    "hasMore": true
  }
}
```

Use `nextCursor` value in the next request to fetch the next page.

### Offset-Based Pagination (Health Metrics)

Health metrics use traditional page-based pagination:

**Request:**
```
GET /api/v1/health-metrics?page=2&limit=10
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

## Migration Guide

### Migrating from Legacy Endpoints

Legacy endpoints (without `/api/v1` prefix) will continue to work but are deprecated. Update your integration to use versioned endpoints:

**Old:**
```
POST /signup
POST /login
GET /activities
```

**New:**
```
POST /api/v1/auth/signup
POST /api/v1/auth/login
GET /api/v1/activities
```

### Key Changes

1. **Consistent Error Format:** All errors now return structured JSON with error codes
2. **Improved Validation:** Better input validation with detailed error messages
3. **Standardized Responses:** All successful responses include `data` or `message` fields
4. **Better Pagination:** Activities use cursor-based pagination for performance

### Testing Your Migration

1. Update base URL from `/` to `/api/v1`
2. Update authentication endpoints to `/api/v1/auth/*`
3. Handle new error response format
4. Test with your existing test suite
5. Monitor for any breaking changes

## Request ID Tracking

Every request receives a unique ID for tracing:

**Response Header:**
```
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
```

This ID is included in error responses and server logs for debugging.

## Best Practices

1. **Always use HTTPS** in production
2. **Store refresh tokens securely** (httpOnly cookies recommended)
3. **Implement token refresh logic** before access token expires
4. **Handle rate limits gracefully** with exponential backoff
5. **Validate input** on client-side before API calls
6. **Use cursor pagination** for large datasets
7. **Include request ID** when reporting issues
8. **Monitor error codes** to detect integration issues

## Support

For API support and questions:
- **Documentation:** This file and inline code comments
- **Issues:** https://github.com/EAasen/Tracksy/issues
- **Changelog:** See CHANGELOG.md for version history

## Version History

### v1.0.0 (2025-10-31)
- Initial API v1 release
- Modular route structure
- Standardized error handling
- JWT authentication
- Activities, health metrics, and auth endpoints
- Comprehensive validation
- Rate limiting
- Request tracking
