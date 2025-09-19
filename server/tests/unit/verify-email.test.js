// Provide default secret for local unit tests
process.env.VERIFY_EMAIL_SECRET =
  process.env.VERIFY_EMAIL_SECRET || "verifysecret";

import { signEmailToken, verifyEmailToken } from "../../utils/verifyEmail.js";

test("sign and verify email token", () => {
  const token = signEmailToken({ sub: "test-user-id" });
  const payload = verifyEmailToken(token);
  expect(payload).toBeDefined();
  expect(payload.sub).toBe("test-user-id");
});
