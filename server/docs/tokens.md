# Tokens

This document explains access and refresh token behaviour.

Access tokens

- Short-lived JWTs used to authorize API requests. Signed with `JWT_SECRET`.
- Typical expiry: short (minutes) to limit exposure.

Refresh tokens

- Opaque random strings. When issued the raw token is returned once to the
  client and the server stores a HMAC-SHA256 hash of the token using
  `REFRESH_TOKEN_PEPPER`.
- Rotation: on each call to `/refresh` the server issues a new refresh token and
  invalidates the previous one. This mitigates stolen token replay.
- Reuse detection: if a rotated-but-used token is detected the server revokes
  all refresh tokens for that user and flags the account for investigation.

Cookies

- The server sets a refresh cookie (HttpOnly). In production the cookie is
  Secure and SameSite as appropriate. For local testing use
  `FORCE_SECURE_COOKIES=true` to test secure cookie behavior.

Storage patterns

- Frontend currently expects JSON response `refreshToken` and stores it in
  `localStorage` (back-compat). The more secure path is to rely on the HttpOnly
  cookie and adapt the frontend to call `refresh` without sending the token in
  the JSON body; frontend changes are documented separately when we perform
  that migration.
