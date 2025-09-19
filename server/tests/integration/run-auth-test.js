(async () => {
  // Lightweight integration smoke test for auth endpoints.
  // Usage: node tests/integration/run-auth-test.js
  // Requires the server to be running at http://localhost:5000
  try {
    if (typeof fetch === "undefined") {
      global.fetch = (...args) =>
        import("node-fetch").then(({ default: fetch }) => fetch(...args));
    }
  } catch (e) {
    console.error("Failed to setup fetch:", e);
  }

  const base = "http://localhost:5000/api/v1/auth";
  const email = `itest+${Date.now()}@example.com`;
  const password = "Str0ng@Pass!";

  async function post(path, body) {
    const res = await fetch(base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, body: json };
  }

  console.log("\n== Integration test: register ==");
  const reg = await post("/register", {
    email,
    password,
    confirmPassword: password,
    firstName: "IT",
    lastName: "Test",
  });
  console.log(reg);
  if (reg.status !== 201) return process.exit(2);

  console.log("\n== Integration test: login ==");
  const login = await post("/login", { email, password });
  console.log(login);
  if (login.status !== 200) return process.exit(3);

  const refreshToken =
    login.body?.data?.refreshToken || reg.body?.data?.refreshToken;
  if (!refreshToken) {
    console.error("No refresh token returned");
    return process.exit(4);
  }

  console.log("\n== Integration test: refresh ==");
  const ref = await post("/refresh", { refreshToken });
  console.log(ref);
  if (ref.status !== 200) return process.exit(5);

  console.log("\n== Integration test: logout ==");
  const lo = await post("/logout", {
    refreshToken: ref.body?.data?.refreshToken || refreshToken,
  });
  console.log(lo);
  if (lo.status !== 200) return process.exit(6);

  console.log("\nIntegration tests passed.");
  process.exit(0);
})();
