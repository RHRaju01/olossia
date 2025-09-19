(async function () {
  // Simple smoke test for auth endpoints: register -> login -> refresh -> logout
  // Uses global fetch (Node 18+). Falls back to node-fetch if needed.
  try {
    if (typeof fetch === "undefined") {
      global.fetch = (...args) =>
        import("node-fetch").then(({ default: fetch }) => fetch(...args));
    }
  } catch (e) {
    console.error("Failed to setup fetch:", e);
  }

  const base = "http://localhost:5000/api/v1/auth";
  const email = `smoke+${Date.now()}@example.com`;
  const password = "Str0ng@Pass!";

  function log(title, obj) {
    console.log("\n=== " + title + " ===");
    try {
      console.log(JSON.stringify(obj, null, 2));
    } catch (e) {
      console.log(obj);
    }
  }

  try {
    // Register
    const regRes = await fetch(base + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        confirmPassword: password,
        firstName: "Smoke",
        lastName: "Test",
      }),
    });
    const regJson = await regRes
      .json()
      .catch(() => ({ status: "no-json", statusCode: regRes.status }));
    log("REGISTER", { status: regRes.status, body: regJson });

    // Login
    const loginRes = await fetch(base + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginJson = await loginRes
      .json()
      .catch(() => ({ status: "no-json", statusCode: loginRes.status }));
    log("LOGIN", { status: loginRes.status, body: loginJson });

    // extract refresh token
    const refreshToken =
      (loginJson &&
        (loginJson.data?.refreshToken ||
          loginJson.refreshToken ||
          loginJson.data?.refresh_token ||
          loginJson.refresh_token)) ||
      (regJson && (regJson.data?.refreshToken || regJson.refreshToken));
    if (!refreshToken) {
      console.error("No refresh token found; aborting refresh/logout steps.");
      process.exit(1);
    }

    // Refresh
    const refRes = await fetch(base + "/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const refJson = await refRes
      .json()
      .catch(() => ({ status: "no-json", statusCode: refRes.status }));
    log("REFRESH", { status: refRes.status, body: refJson });

    // get new refresh token
    const newRefresh =
      (refJson &&
        (refJson.data?.refreshToken ||
          refJson.refreshToken ||
          refJson.data?.refresh_token ||
          refJson.refresh_token)) ||
      refreshToken;

    // Logout
    const loRes = await fetch(base + "/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: newRefresh }),
    });
    const loJson = await loRes
      .json()
      .catch(() => ({ status: "no-json", statusCode: loRes.status }));
    log("LOGOUT", { status: loRes.status, body: loJson });

    console.log("\nSmoke test finished.");
    process.exit(0);
  } catch (err) {
    console.error("Smoke test failed:", err);
    process.exit(2);
  }
})();
