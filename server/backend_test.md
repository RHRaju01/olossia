# Backend PowerShell + Node integration Test Guide

This file contains commands and a small Node integration test to exercise the
authentication endpoints locally against the running server.

Prerequisites

- Node 18+ (for built-in fetch) or install `node-fetch` in the server workspace.
- A working `server/.env` and the server running at `http://localhost:5000`.

Base URL

$base = "http://localhost:5000/api/v1/auth"

1. Start the server (in `server/` folder)

Run this in a new PowerShell terminal from the repository root:

```powershell
cd server; npm run dev
```

2. Manual PowerShell steps (register, login, refresh, logout)

Register (signup)

```powershell
$body = @{
  email = "testuser+1@example.com"
  password = "Str0ng@Pass!"
  confirmPassword = "Str0ng@Pass!"
  firstName = "Test"
  lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/register" -Method Post -Body $body -ContentType "application/json"
```

Expected: 201 with JSON containing `token` and `refreshToken` (plain opaque refresh token).

Login

```powershell
$body = @{
  email = "testuser+1@example.com"
  password = "Str0ng@Pass!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/login" -Method Post -Body $body -ContentType "application/json"
```

Refresh

```powershell
# Replace <refresh-token-here> with the refresh token returned by login
$body = @{
  refreshToken = "<refresh-token-here>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/refresh" -Method Post -Body $body -ContentType "application/json"
```

Logout

```powershell
# Provide the refresh token you want to revoke
$body = @{
  refreshToken = "<refresh-token-here>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/logout" -Method Post -Body $body -ContentType "application/json"
```

3. Automated Node integration test

We've added a lightweight integration script that runs the full flow. Start the
server, then run this in the `server` folder:

```powershell
cd server; npm run test:integration
```

The script will exit with a non-zero status code on failure and prints the JSON
responses for each step. It's intentionally minimal (no test framework) so it is
easy to run in CI or locally.

Notes

- If you run the server with `DATABASE_TYPE=supabase` and `DATABASE_URL` present,
  the code may attempt to use a direct Postgres connection for raw SQL. If your
  environment cannot reach the DB port, set `FORCE_SUPABASE_CLIENT=true` in
  `server/.env` to force the Supabase JS client (HTTP) path. This is useful in
  environments where outbound TCP to Postgres is blocked but HTTPS is allowed.
- The `refreshToken` returned by our API is an opaque string (not a JWT). Keep
  it secret.
- For development convenience you can set `AUTO_VERIFY_NEW_USERS=true` in
  `server/.env` to auto-verify accounts at registration (useful when you don't
  have an email sender configured). Keep it `false` for production.

Debugging

- If you get DB connection errors, check `server/.env` for `DATABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` and verify network access.
- If token verification fails, ensure `JWT_SECRET` is set in `.env`.
