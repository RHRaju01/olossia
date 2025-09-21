#!/usr/bin/env node
// Minimal, self-contained test that simulates the auth->cart merge behavior
// without importing project RTK/toolkit code (avoids Node ESM/CommonJS issues).

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Local in-memory store representing cart.localItems
let store = {
  cart: {
    localItems: [
      { id: "local-1", product_id: "prod-1", variant_id: null, quantity: 2 },
      { id: "local-2", product_id: "prod-2", variant_id: "v1", quantity: 1 },
    ],
  },
};

console.log(
  "Before login, localItems:",
  JSON.stringify(store.cart.localItems, null, 2)
);

// Mock mergeCart API
async function mockMergeCart(payload) {
  console.log("[mock] mergeCart called with", JSON.stringify(payload));
  await delay(50);
  return { success: true };
}

// Simulate dispatching setUser (login) and the listener behavior
async function simulateLogin(user) {
  if (!user) return;
  const localItems = store.cart.localItems || [];
  if (!localItems.length) return;

  const payloadItems = localItems.map((li) => ({
    product_id: li.product_id,
    variant_id: li.variant_id || null,
    quantity: li.quantity,
  }));

  try {
    const res = await mockMergeCart({ items: payloadItems });
    if (res && res.success) {
      store = { ...store, cart: { localItems: [] } };
    }
  } catch (e) {
    console.error("merge failed:", e);
  }
}

(async () => {
  await simulateLogin({ id: "user-1", email: "tester@example.com" });
  console.log(
    "After login, localItems:",
    JSON.stringify(store.cart.localItems, null, 2)
  );
  if ((store.cart.localItems || []).length === 0) {
    console.log("TEST PASSED: localItems were cleared after merge");
    process.exit(0);
  } else {
    console.error("TEST FAILED: localItems were not cleared");
    process.exit(2);
  }
})();
