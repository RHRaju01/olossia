# Auth Overview

This document describes the authentication design used by the server.

Key points

- Password hashing: Argon2id (via `argon2` package). Use environment tuned
  parameters (see `server/.env.example`).
- Access tokens: short-lived JWTs signed with `JWT_SECRET`.
- Refresh tokens: Opaque random tokens stored hashed in the database. The raw
  value is returned to the client once at issuance. The server stores HMAC-SHA256
  of the refresh token using `REFRESH_TOKEN_PEPPER`.
- Refresh rotation: each refresh exchanges the used token for a new token and
  invalidates the previous one. Reuse detection revokes all a user's refresh
  tokens and optionally triggers an admin alert.
- Cookies: server sets an HttpOnly refresh cookie. The `FORCE_SECURE_COOKIES`
  env var allows testing Secure flag behavior locally.

Endpoints (summary)

- `POST /api/v1/auth/register` - create account and send verification email
- `POST /api/v1/auth/login` - authenticate and receive `token` + `refreshToken`
- `POST /api/v1/auth/refresh` - rotate refresh token and receive new `token`
- `POST /api/v1/auth/logout` - revoke a single refresh token
- `POST /api/v1/auth/request-password-reset` - send password reset email
- `POST /api/v1/auth/confirm-password-reset` - confirm reset with token
- `POST /api/v1/auth/verify-email` - verify account using token

Security notes

- Keep `REFRESH_TOKEN_PEPPER` and `JWT_SECRET` safe. Rotate them carefully
  (rotation requires invalidating previously-issued tokens).
- In production use strong Argon2 parameters (see `.env.example`) and `FORCE_SECURE_COOKIES=true`.
