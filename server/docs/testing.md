# Testing Guide

This document contains notes about running the server test suites, manual
PowerShell integration steps, and common issues.

Run all tests

```powershell
cd server; npm test
```

Run integration tests only (if available)

```powershell
cd server; npm run test:integration
```

## Manual PowerShell integration guide

This section is a consolidation of the `backend_test_guide.md` material — it
shows how to exercise the auth flows manually and run quick integration
verification using PowerShell. The examples assume the server runs at
`http://localhost:5000`.

Base URL

$base = "http://localhost:5000/api/v1/auth"

Start the server

Open a new PowerShell terminal in the repository root and run:

```powershell
cd server; npm run dev
```

Register (signup)

```powershell
$body = @{
  email = "testuser+1@example.com"
  password = "Str0ng@Pass!"
  confirmPassword = "Str0ng@Pass!"
  firstName = "Test"
  lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/register" -Method Post -Body $body -ContentType "application/json" -SkipHeaderValidation
```

Login

```powershell
$body = @{
  email = "testuser+1@example.com"
  password = "Str0ng@Pass!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/login" -Method Post -Body $body -ContentType "application/json"
```

Refresh access token

```powershell
# Replace <refresh-token-here> with the refresh token returned by login
$body = @{
  refreshToken = "<refresh-token-here>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/refresh" -Method Post -Body $body -ContentType "application/json"
```

Logout (revoke one refresh token)

```powershell
# Provide the refresh token you want to revoke
$body = @{
  refreshToken = "<refresh-token-here>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/logout" -Method Post -Body $body -ContentType "application/json"
```

Email verification

If your environment sends email (SMTP configured) the server will send a
verification email at registration. To test without SMTP set
`AUTO_VERIFY_NEW_USERS=true` in `server/.env` to auto-verify accounts.

Password reset (request + confirm)

Request reset (sends an email with a token):

```powershell
$body = @{ email = "testuser+1@example.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "$base/request-password-reset" -Method Post -Body $body -ContentType "application/json"
```

Confirm reset (token + new password)

```powershell
$body = @{
  token = "<token-from-email>"
  password = "NewStr0ng@Pass!"
  confirmPassword = "NewStr0ng@Pass!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$base/confirm-password-reset" -Method Post -Body $body -ContentType "application/json"
```

Common issues

- Argon2 parameter errors: Argon2 requires a minimum `timeCost` of 2. If tests
  fail with "Invalid timeCost", set test-friendly Argon2 env vars in
  `.env.test` or your shell before running.
- DB connectivity: ensure `DATABASE_URL` is reachable. Use `FORCE_SUPABASE_CLIENT`
  if Postgres TCP is blocked.
- Email tests: if you don't have SMTP configured, set `AUTO_VERIFY_NEW_USERS=true`
  to skip email sending.

CI

- The repo contains a GitHub Actions workflow at
  `.github/workflows/nodejs-tests.yml` which runs the Jest suites. If CI fails
  due to account restrictions re-run the workflow locally with `npm test`.

Test automation recommendations

- Add a small external smoke-test job that runs the integration script against
  a freshly started server using the same `.env` values as your staging target.
- Use ephemeral DB schemas or a test DB to avoid polluting production data.

Further reading

- See other docs in this folder for short reference docs on auth, tokens and email flows.
