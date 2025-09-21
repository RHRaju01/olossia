#!/usr/bin/env node
// Smoke-test script for cart endpoints
// Usage: node server/scripts/smoke-cart.js

// API is mounted under /api/v1 and default server port is 5000
const DEFAULT_PORT = process.env.PORT || 5000;
const BASE = process.env.BASE_URL || `http://localhost:${DEFAULT_PORT}/api/v1`;

async function fetchJson(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
    return { ok: res.ok, status: res.status, body: parsed };
  } catch (err) {
    return { ok: false, status: null, error: err.message };
  }
}

function pickToken(payload) {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (payload.token) return payload.token;
  if (payload.accessToken) return payload.accessToken;
  if (payload.access_token) return payload.access_token;
  if (payload.data) return pickToken(payload.data);
  return null;
}

(async function main() {
  console.log("Starting smoke test against", BASE);

  // 1: health
  const health = await fetchJson(`${BASE}/health`);
  console.log("HEALTH", health.status, JSON.stringify(health.body));
  if (!health.ok) {
    console.error("Health check failed, aborting.");
    process.exit(2);
  }

  // 2: register (ignore failure if already exists)
  // Use the test user details (must match validation: firstName/lastName, confirmPassword)
  const regBody = {
    email: "rhraju01@gmail.com",
    password: "Pass1234!",
    confirmPassword: "Pass1234!",
    firstName: "Robiul",
    lastName: "Hossain",
  };
  const reg = await fetchJson(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(regBody),
  });
  console.log(
    "REGISTER",
    reg.status,
    reg.ok ? JSON.stringify(reg.body) : reg.error || reg.body
  );

  // 3: login
  const loginBody = { email: "rhraju01@gmail.com", password: "Pass1234!" };
  const login = await fetchJson(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(loginBody),
  });
  console.log(
    "LOGIN",
    login.status,
    login.ok ? JSON.stringify(login.body) : login.error || login.body
  );
  if (!login.ok) {
    console.error("Login failed, aborting");
    process.exit(3);
  }

  const token = pickToken(login.body);
  if (!token) {
    console.error("No token found in login response; aborting.");
    process.exit(4);
  }
  console.log(
    "Token acquired (first 12 chars):",
    token.toString().slice(0, 12)
  );
  const headers = {
    Authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };

  // 4: fetch products
  const products = await fetchJson(`${BASE}/products`);
  console.log("PRODUCTS", products.status, JSON.stringify(products.body));

  let productId = null;
  if (products.ok && products.body) {
    // Support multiple response shapes:
    // - { success: true, data: [ ... ] }
    // - { success: true, data: { products: [ ... ], pagination: {...} } }
    // - [ ... ]
    const body = products.body;
    let list = null;
    if (body.data) {
      if (Array.isArray(body.data)) list = body.data;
      else if (body.data.products && Array.isArray(body.data.products))
        list = body.data.products;
    } else if (Array.isArray(body)) {
      list = body;
    } else if (body.products && Array.isArray(body.products)) {
      list = body.products;
    }

    if (list && list.length > 0) productId = list[0].id;
  }
  console.log("Selected product id:", productId);

  // 5: add item
  if (productId) {
    const addBody = { product_id: productId, quantity: 1 };
    const add = await fetchJson(`${BASE}/cart/items`, {
      method: "POST",
      headers,
      body: JSON.stringify(addBody),
    });
    console.log(
      "ADD",
      add.status,
      add.ok ? JSON.stringify(add.body) : add.error || add.body
    );
  } else {
    console.log("No product available to add.");
  }

  // 6: merge
  if (productId) {
    const mergeBody = { items: [{ product_id: productId, quantity: 2 }] };
    const merge = await fetchJson(`${BASE}/cart/merge`, {
      method: "POST",
      headers,
      body: JSON.stringify(mergeBody),
    });
    console.log(
      "MERGE",
      merge.status,
      merge.ok ? JSON.stringify(merge.body) : merge.error || merge.body
    );
  }

  // 7: get cart
  const cart = await fetchJson(`${BASE}/cart`, { method: "GET", headers });
  console.log(
    "CART",
    cart.status,
    cart.ok ? JSON.stringify(cart.body) : cart.error || cart.body
  );

  // 8: delete first item
  let itemId = null;
  if (cart.ok && cart.body && cart.body.data && cart.body.data.length > 0)
    itemId = cart.body.data[0].id;
  if (itemId) {
    const del = await fetchJson(`${BASE}/cart/items/${itemId}`, {
      method: "DELETE",
      headers,
    });
    console.log(
      "DELETE",
      del.status,
      del.ok ? JSON.stringify(del.body) : del.error || del.body
    );
  } else {
    console.log("No item to delete");
  }

  // 9: final cart
  const final = await fetchJson(`${BASE}/cart`, { method: "GET", headers });
  console.log(
    "FINAL CART",
    final.status,
    final.ok ? JSON.stringify(final.body) : final.error || final.body
  );

  console.log("Smoke test complete.");
  process.exit(0);
})();
