import request from "supertest";
import app from "../../app.js";
import { startServer } from "../../server.js";
// (no direct model imports needed; test exercises endpoints via HTTP)

let server;

beforeAll(async () => {
  process.env.REFRESH_TOKEN_PEPPER =
    process.env.REFRESH_TOKEN_PEPPER || "pepper123";
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "jwtrefreshsecret";
  process.env.VERIFY_EMAIL_SECRET =
    process.env.VERIFY_EMAIL_SECRET || "verifysecret";
  process.env.AUTO_VERIFY_NEW_USERS = "true";
  server = await startServer(0);
});

afterAll(async () => {
  if (server && server.close) await new Promise((r) => server.close(r));
  if (server && server.pruneJob) clearInterval(server.pruneJob);
});

test("revoked refresh token reuse triggers revoke-all and 401", async () => {
  const email = `reuse${Date.now()}@example.com`;
  const password = "P@ssword1";

  // Register user
  const reg = await request(app).post("/api/v1/auth/register").send({
    email,
    password,
    confirmPassword: password,
    firstName: "RU",
    lastName: "Test",
  });
  expect(reg.status).toBe(201);
  const rt = reg.body.data.refreshToken;
  expect(rt).toBeTruthy();

  // Use refresh to rotate (valid)
  const r1 = await request(app)
    .post("/api/v1/auth/refresh")
    .send({ refreshToken: rt });
  expect(r1.status).toBe(200);
  const rotated = r1.body.data.refreshToken;
  expect(rotated).toBeTruthy();

  // Attempt to reuse the old token (rt) -> should detect reuse and return 401
  const r2 = await request(app)
    .post("/api/v1/auth/refresh")
    .send({ refreshToken: rt });
  expect(r2.status).toBe(401);

  // Subsequent refresh with rotated token should also be invalid because revoke-all was triggered
  const r3 = await request(app)
    .post("/api/v1/auth/refresh")
    .send({ refreshToken: rotated });
  expect(r3.status).toBe(401);
}, 60000);
