// Simple smoke test for auth: register -> login -> profile
// Usage: node scripts/smoke-auth.js

// Node 18+ provides global `fetch`, no external dependency required
const BASE = process.env.API_BASE || "http://localhost:5000/api/v1";

// Simple retry helper with exponential backoff
async function retry(fn, { retries = 3, backoffMs = 500 } = {}) {
  let attempt = 0;
  let lastErr;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      attempt++;
      if (attempt < retries) {
        const wait = backoffMs * Math.pow(2, attempt - 1);
        console.warn(
          `Retry ${attempt}/${retries} after ${wait}ms due to error:`,
          err && err.message ? err.message : err
        );
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

async function run() {
  const random = Math.floor(Math.random() * 100000);
  const email = `smoke${random}@example.com`;
  const password = "Pass1234!";
  const firstName = "Smoke";
  const lastName = "Tester";

  console.log("BASE:", BASE);

  // Register (with retries)
  console.log("Registering", email);
  const regResp = await retry(
    () =>
      fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword: password,
        }),
        credentials: "include",
      }),
    { retries: 3, backoffMs: 300 }
  );
  const regData = await regResp.json().catch(() => null);
  console.log("Register status:", regResp.status, regData);

  // Login (with retries)
  console.log("Logging in");
  const loginResp = await retry(
    () =>
      fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      }),
    { retries: 3, backoffMs: 300 }
  );
  const loginData = await loginResp.json().catch(() => null);
  console.log("Login status:", loginResp.status, loginData);

  // If tokens set in cookies, try profile
  console.log("Getting profile");
  const token = loginData?.data?.token || regData?.data?.token;
  const profileHeaders = { "Content-Type": "application/json" };
  if (token) {
    profileHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Profile (with retries)
  // Optional short delay before requesting profile to avoid triggering server rate limits
  const profileDelay = parseInt(
    process.env.SMOKE_PROFILE_DELAY_MS || "1500",
    10
  );
  if (profileDelay > 0) {
    console.log(
      `Waiting ${profileDelay}ms before fetching profile to avoid rate-limit`
    );
    await new Promise((r) => setTimeout(r, profileDelay));
  }

  // Use retry helper but treat HTTP 429 as retryable by throwing so retry() will backoff
  const profileResp = await retry(
    async () => {
      const resp = await fetch(`${BASE}/auth/profile`, {
        method: "GET",
        headers: profileHeaders,
        credentials: "include",
      });
      if (resp.status === 429) {
        // Throw an error to signal retry (retry() will backoff)
        const err = new Error("Too many attempts (429)");
        err.status = 429;
        throw err;
      }
      return resp;
    },
    { retries: 5, backoffMs: 500 }
  );
  const profileData = await profileResp.json().catch(() => null);
  console.log("Profile status:", profileResp.status, profileData);

  const ok =
    (regResp.status === 200 || regResp.status === 201) &&
    loginResp.status === 200 &&
    profileResp.status === 200;
  console.log(ok ? "SMOKE PASS" : "SMOKE FAIL");
  process.exit(ok ? 0 : 1);
}

run().catch((err) => {
  console.error("Error running smoke test:", err);
  process.exit(2);
});
