# RPES Backend API Documentation

Welcome to the RPES Backend API Documentation! This guide provides front-end developers with everything they need to integrate seamlessly with our backend services.

## Base Configuration

- **Base URL:** `http://localhost:3002` (or your configured `PORT`)
- **API Prefix:** `/api/v1`

---

## 📦 Standard Response Structure

To ensure a consistent developer experience, all API endpoints return responses using a standardized format.

### ✅ Success Response

When an API call is successful (`statusCode < 400`), it returns the following structure:

```json
{
  "statusCode": 200,
  "message": "Descriptive success message",
  "data": { 
    // Requested payload or related data
  },
  "success": true,
  "code": null
}
```

### ❌ Error Response

When an API call fails (`statusCode >= 400`), it returns a structured error:

```json
{
  "statusCode": 400,
  "message": "Detailed error message explaining the failure",
  "data": null,
  "success": false,
  "code": "OPTIONAL_ERROR_CODE"
}
```

---

## 🛠️ Global Endpoints

### 1. Health Check
Verify that the backend server is running and healthy.

- **Endpoint:** `/health`
- **Method:** `GET`
- **Access:** Public

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "API running successfully"
}
```
*(Note: This is a standalone express route and doesn't use the standard `ApiResponse` wrapper)*

---

## 🔐 Authentication Module

The authentication system uses a dual-token mechanism:
1. **Access Token:** Short-lived JWT returned in the response payload. Include this in the `Authorization: Bearer <token>` header for protected routes.
2. **Refresh Token:** Long-lived JWT managed via secure, HTTP-only cookies. It is automatically sent by the browser.

### 1. User Login
Authenticates a user and establishes a secure session.

- **Endpoint:** `/api/v1/auth/login`
- **Method:** `POST`
- **Access:** Public

**Request Body (`application/json`):**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "User login successfully",
  "data": {
    "userName": "John Doe",
    "userRole": "admin",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
  },
  "success": true,
  "code": null
}
```
**Side Effects:** Sets `refreshToken` as an `HttpOnly`, `Secure` cookie.

**Error Responses:**
- `400 Bad Request`: Missing credentials, user not found, or invalid password.

---

### 2. Refresh Token
Generates a new access token and rotates the refresh token to maintain an active session securely.

- **Endpoint:** `/api/v1/auth/refresh`
- **Method:** `POST`
- **Access:** Public (Requires valid `refreshToken` cookie)

**Request Cookies:**
- `refreshToken`: The HTTP-only cookie set during login.

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "User login successfully",
  "data": {
    "userName": "John Doe",
    "userRole": "admin",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR... (NEW_TOKEN)"
  },
  "success": true,
  "code": null
}
```
**Side Effects:** Rotates and sets a new `refreshToken` cookie, invalidating the old one.

**Error Responses:**
- `400 Bad Request`: `TOKEN_MISSING`, `INVALID_SESSION`, `INVALID_TOKEN`, or `USER_NOT_FOUND`.

---

### 3. User Logout
Terminates the active session and clears the refresh token cookie.

- **Endpoint:** `/api/v1/auth/logout`
- **Method:** `POST`
- **Access:** Public (Reads `refreshToken` cookie)

**Request Cookies:**
- `refreshToken`: The HTTP-only cookie set during login.

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null,
  "success": true,
  "code": null
}
```
**Side Effects:** Clears the `refreshToken` cookie and deletes the active session from Redis.
