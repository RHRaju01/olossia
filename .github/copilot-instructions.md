# Olossia AI Coding Agent Instructions

## Architecture Overview

This is a full-stack fashion e-commerce platform with dual frontend/backend design:

- **Frontend**: React 18 + Vite in root directory (`src/`)
- **Backend**: Express.js API in `server/` directory  
- **Database**: Flexible Supabase/PostgreSQL via single environment toggle (`DATABASE_TYPE`)
- **State Management**: Hybrid Context API + Redux Toolkit Query pattern
- **Authentication**: JWT + refresh tokens with automatic token rotation

## Critical Database Switching Pattern

The app supports switching between Supabase and PostgreSQL with one environment variable:

```env
# server/.env
DATABASE_TYPE=supabase  # or 'postgresql'
```

- Database abstraction layer: `server/config/database.js` exports unified `dbQuery()` function
- Models like `User.js`, `RefreshToken.js` use this abstraction to work with both databases
- Always use the `dbQuery()` wrapper, never direct client calls

## Authentication Architecture

**Core Pattern**: Dual token system with automatic refresh rotation

1. **Access Tokens**: Short-lived JWTs (7 days) for API authentication
2. **Refresh Tokens**: Database-stored, hashed tokens (30 days) for token renewal
3. **Token Storage**: `tokenStorage` utility in `src/utils/tokenStorage.js`
4. **Automatic Refresh**: Axios interceptor in `src/services/api/rest/client.js`

**Key Files**:
- `server/models/RefreshToken.js` - Token lifecycle management
- `server/controllers/authController.js` - Auth endpoints with rotation logic
- `src/hooks/useAuthRedux.js` - Client-side auth state management
- `src/components/auth/ProtectedRoute.jsx` - Route protection

**Testing Authentication**: Use `npm run smoke:auth` or `scripts/smoke-test.js` for end-to-end auth flow testing.

## State Management Hybrid Pattern

**Context + Redux Combination**:
- **Redux**: Cart state (`@reduxjs/toolkit` with RTK Query for server sync)
- **Context**: Wishlist (`WishlistContext`) and Compare (`CompareContext`) 
- **React Query**: Legacy product fetching (being migrated to RTK Query)

**Key State Files**:
- `src/store/store.js` - Redux store with cart middleware
- `src/contexts/WishlistContext.jsx` - Client-side wishlist management
- `src/services/api/rtk/baseApi.js` - RTK Query base configuration

## Component Architecture

**Structure**:
```
src/components/
├── ui/              # shadcn/ui base components  
├── sections/        # Page sections (HeroSection, CategorySection)
├── common/          # Shared components (SearchBar, ProductCard)
├── layout/          # Layout components (MainLayout)
└── auth/            # Authentication components
```

**Patterns**:
- Lazy loading for all pages: `const HomePage = React.lazy(() => import("./pages/HomePage"))`
- Component composition with sections: Pages combine multiple reusable sections
- Custom hooks for business logic: `useProducts.js`, `useAuthRedux.js`

## API Patterns

**Dual API Strategy**:
- **REST**: Existing `src/services/api/rest/` for legacy endpoints
- **RTK Query**: New `src/services/api/rtk/` for type-safe, cached queries

**Server Structure**:
- Controllers: Business logic in `server/controllers/`
- Middleware: Auth, validation, security in `server/middleware/`
- Models: Database-agnostic models in `server/models/`
- Routes: Express routes in `server/routes/`

## Development Workflows

**Frontend Development**:
```bash
npm run dev          # Vite dev server with HMR
npm test             # Vitest with jsdom
npm run build        # Production build with chunk optimization
```

**Backend Development**:
```bash
cd server
npm run dev          # Node --watch for auto-restart
npm test             # Jest integration tests
npm run test:unit    # Specific unit tests
```

**Testing Strategy**:
- Smoke tests: `scripts/smoke-test.js` for auth flow
- Integration: `server/tests/integration/` for API endpoints  
- Unit: `server/tests/unit/` for model/utility testing
- Frontend: Vitest setup in `vitest.config.js`

## Build Configuration Specifics

**Vite Optimizations** (`vite.config.ts`):
- Manual chunk splitting: vendor, ui, utils bundles
- JSX handling for `.js` files via esbuild
- TailwindCSS integration via PostCSS
- Source maps disabled for production builds

**TailwindCSS** (`tailwind.config.js`):
- Custom color system with CSS variables
- shadcn/ui integration patterns  
- Custom font families with CSS variable pattern
- Container-centered responsive design

## Security Patterns

**Password Hashing**: Argon2id with tunable environment parameters:
- `ARGON_MEMORY_COST`, `ARGON_TIME_COST`, `ARGON_PARALLELISM`
- Test mode uses lighter settings for speed

**Token Security**:
- HttpOnly refresh cookies in production (`FORCE_SECURE_COOKIES=true`)
- Refresh token rotation prevents reuse attacks
- Token reuse detection revokes all user tokens

**API Security**: Rate limiting, CORS, Helmet, input validation via express-validator

## Common Debugging Commands

**Check Database Connection**:
```bash
cd server && node -e "import('./config/database.js').then(d => d.testConnection())"
```

**Test Auth Flow**:
```bash
npm run smoke:auth  # Frontend smoke test
cd server && npm run test:integration  # Backend integration test
```

**Development with Different Database**:
```bash
# Switch to PostgreSQL
echo "DATABASE_TYPE=postgresql" >> server/.env
# Switch to Supabase  
echo "DATABASE_TYPE=supabase" >> server/.env
```

## File Naming Conventions

- **Components**: PascalCase (`ProductCard.jsx`)
- **Hooks**: camelCase with `use` prefix (`useAuthRedux.js`)
- **Services**: camelCase (`authAPI.js`, `productAPI.js`) 
- **Models**: PascalCase (`User.js`, `RefreshToken.js`)
- **Contexts**: PascalCase with `Context` suffix (`WishlistContext.jsx`)

## Integration Points

**Key External Services**:
- Supabase: Database + authentication (when `DATABASE_TYPE=supabase`)
- PostgreSQL: Direct database connection (when `DATABASE_TYPE=postgresql`)
- Email: Nodemailer configuration in `server/services/`

**Cross-Component Communication**:
- Auth state flows through Redux (`useAuthRedux` hook)
- Cart syncs between local Redux state and server via RTK Query
- Wishlist/Compare use React Context for client-side persistence

When making changes, always consider both database modes and test the auth flow with smoke tests.

## CI/CD Integration (how agents should interact)

Purpose: ensure AI agents make CI-friendly changes, avoid leaking secrets, and trigger safe automated verification.

- Commit hygiene: create small, focused branches named `bot/<task>-<short>` (e.g. `bot/add-auth-endpoint`).
- Never write secrets to files. Use placeholders like `<<JWT_SECRET>>` and document required env vars in `server/.env.example`.
- Add or update GitHub Actions workflows under `.github/workflows/` to run fast verifications for PRs. Suggested minimal workflow steps for PRs:
  1. Checkout
  2. Setup Node.js 18
  3. Install dependencies in root and `server/` (use `npm ci` when lockfile present)
  4. Run lint/type checks (if configured)
  5. Run unit tests (server `npm run test:unit`) and frontend tests (`npm test`)
  6. Run smoke auth script against a test server (optional) — see `scripts/smoke-test.js`.

Example (condensed) workflow snippet to add to `.github/workflows/pr-check.yml`:

```yaml
name: PR checks
on: [pull_request]
jobs:
  quick-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install root deps
        run: npm ci
      - name: Install server deps
        run: cd server; npm ci
      - name: Run frontend tests
        run: npm test --silent
      - name: Run backend unit tests
        run: cd server; npm run test:unit
```

- Guidance for agents: if a change requires a longer integration test (database migrations, full integration tests) create a PR and add a `needs-integration` label; do not auto-merge. Provide a short checklist in the PR body describing the external resources required (Postgres instance, Supabase project, env vars).

## Protected endpoint: concrete example

Add a new protected route that returns a user's order history. Use the `authenticate` middleware from `server/middleware/auth.js` and optional role checks with `authorize`.

Server-side example: `server/routes/orders.js` and `server/controllers/orderController.js` (concise):

Example route (server/routes/orders.js):

```js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { orderController } from '../controllers/orderController.js';

const router = express.Router();

// Only authenticated customers and admins can fetch orders
router.get('/', authenticate, orderController.getOrdersForUser);

// Admin-only listing
router.get('/all', authenticate, authorize('admin'), orderController.listAllOrders);

export default router;
```

Example controller handler (server/controllers/orderController.js):

```js
export const orderController = {
  getOrdersForUser: async (req, res) => {
    try {
      const userId = req.user.id; // injected by authenticate
      const rows = await dbQuery('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return res.json({ success: true, data: { orders: rows.rows || rows } });
    } catch (err) {
      console.error('Get orders error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },
  listAllOrders: async (req, res) => {
    // ...admin listing
  }
};
```

Sample request/response (GET /api/v1/orders)

Request headers:

  Authorization: Bearer <access-token>

Response (200):

```json
{
  "success": true,
  "data": {
    "orders": [
      { "id": 1, "user_id": 42, "total": 129.99, "created_at": "2025-09-01T12:00:00Z" }
    ]
  }
}
```

Response (401 if no/invalid token):

```json
{ "success": false, "message": "Invalid or expired token" }
```

## Token lifecycle (code snippets)

Server: creating tokens (example sketch from `server/controllers/authController.js`)

```js
import { signAccessToken, generateRandomToken } from '../utils/jwt.js';
import { RefreshToken } from '../models/RefreshToken.js';

// On login/register
const token = signAccessToken({ id: user.id, role: user.role });
const { token: refreshPlain, id: refreshId } = await RefreshToken.create({ userId: user.id });
// return both to client (refresh as HttpOnly cookie or response body per env)

res.json({ success: true, data: { token, refreshToken: refreshPlain, user } });
```

Server: refresh endpoint (rotation)

```js
// POST /auth/refresh
const row = await RefreshToken.findByToken(req.body.refreshToken);
if (!row) return res.status(401).json({ success: false });
// revoke used token
await RefreshToken.revokeById(row.id);
// issue new refresh and access tokens
const { token: newRefreshPlain } = await RefreshToken.create({ userId: row.user_id });
const access = signAccessToken({ id: row.user_id, role: row.role });
res.json({ success: true, data: { token: access, refreshToken: newRefreshPlain } });
```

Client-side: storing and auto-refresh (from `src/services/api/rest/client.js` + `src/utils/tokenStorage.js`):

```js
// tokenStorage.setToken(token); tokenStorage.setRefreshToken(refresh);
// Axios interceptor example (simplified)
apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) { tokenStorage.clearAll(); return Promise.reject(error); }
      const response = await axios.post(`${BASE}/auth/refresh`, { refreshToken });
      if (response.data.success) {
        tokenStorage.setToken(response.data.data.token);
        tokenStorage.setRefreshToken(response.data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
```

Notes for agents:
- Refresh tokens are single-use on the server. When calling `refresh`, expect the old token to be invalidated. Handle 401s gracefully by clearing stored tokens and redirecting to login.

## Testing instructions (expanded)

Automated tests in this repo fall into three categories:

- Unit tests: fast; run with `cd server; npm run test:unit` (runs small node scripts) or `npm test` in root for frontend units.
- Integration tests: exercise the HTTP stack and token flows. Run `cd server; npm run test:integration` which uses `node tests/integration/run-auth-test.js` and expects a local test DB or supabase configured.
- Smoke tests: quick end-to-end checks independent of test harnesses. Use `npm run smoke:auth` (root) or `node scripts/smoke-test.js` to verify register -> login -> refresh -> logout flows.

Recommended test cases for PRs that touch auth or DB:

1. Register new user -> expect 201 and a refresh token in response
2. Login with new user -> expect 200 and valid access + refresh tokens
3. Use access token to call protected endpoint -> expect 200
4. Force access token expiry (simulate by using a bad token) -> client should call refresh endpoint and succeed
5. Logout -> refresh token is revoked and subsequent refresh attempts fail

Example command block to run quick checks locally (PowerShell):

```powershell
# In root (frontend tests)
npm test
npx vite --version
npx vitest --run

# In server (backend tests)
cd server; npm run test:unit
cd server; npm run test:integration
```

## AGENT.md decision

I can convert this file into a full `AGENT.md` (richer step-by-step playbook with example PR templates, labels, and checklists). I left that as an explicit follow-up: create `AGENT.md` if you'd like a more prescriptive agent playbook. Reply with "Create AGENT.md" to proceed.

---

When you're ready tell me if you want `AGENT.md` created, or ask me to adjust any section above. Once confirmed I'll mark the todo items completed and, if requested, generate `AGENT.md` with PR templates and workflow examples.