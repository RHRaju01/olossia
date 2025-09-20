# Email

The server sends templated emails for verification, password reset and alerts.

Local dev

- If SMTP is not configured the server uses an Ethereal (nodemailer) preview
  account when available and logs the preview URL in the console.
- Use `AUTO_VERIFY_NEW_USERS=true` to bypass sending verification emails in
  local development.

Templates

- Templates live in `server/templates/` and are simple HTML/text pairs. Edit
  carefully and keep placeholders consistent.

Testing

- To verify email tokens in tests, either parse the Ethereal preview URL from
  logs or set `AUTO_VERIFY_NEW_USERS=true` and call the verify endpoint in tests.

Security

- Do not store SMTP credentials in plain text in public repositories. Use
  secrets in CI and environment variables on servers.
