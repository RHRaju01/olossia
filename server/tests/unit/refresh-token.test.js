// Ensure required env vars exist for local unit tests (safe defaults for CI/dev)
process.env.REFRESH_TOKEN_PEPPER =
  process.env.REFRESH_TOKEN_PEPPER || "pepper123";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "jwtrefreshsecret";

import {
  hashRefreshToken,
  compareRefreshToken,
} from "../../utils/encryption.js";

test("hash and compare refresh token", () => {
  const sample = "sometoken123";
  const h = hashRefreshToken(sample);
  const ok = compareRefreshToken(sample, h);
  expect(typeof h).toBe("string");
  expect(ok).toBe(true);
});
