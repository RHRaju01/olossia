# Server

This folder contains the backend server for the Olossia project.

Quick start

1. Copy `.env.example` to `.env` and fill in the required values.
2. Install dependencies and run:

```powershell
cd server; npm install; npm run dev
```

Testing

- Run unit & integration tests:

```powershell
cd server; npm test
```

- Integration-only script (if present):

```powershell
cd server; npm run test:integration
```

Docs

Short reference docs live in `server/docs/`. They include:

- `auth.md` - authentication flow overview
- `tokens.md` - refresh & access token behavior
- `testing.md` - how to run tests and common troubleshooting
- `email.md` - email sending, Ethereal fallback and templates

Contacts

For issues with CI, email or environment setup ask the repo maintainer.
