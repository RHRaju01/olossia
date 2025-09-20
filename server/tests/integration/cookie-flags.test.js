import request from "supertest";
import app from "../../app.js";
import { startServer } from "../../server.js";

let server;

beforeAll(async () => {
  process.env.NODE_ENV = "production";
  process.env.FORCE_SECURE_COOKIES = "true";
  process.env.AUTO_VERIFY_NEW_USERS = "true";
  process.env.REFRESH_TOKEN_PEPPER = process.env.REFRESH_TOKEN_PEPPER || "pepper-for-tests";
  server = await startServer(0);
});

afterAll(async () => {
  if (server && server.close) await new Promise((r) => server.close(r));
  if (server && server.pruneJob) clearInterval(server.pruneJob);
});

test("refresh cookie has Secure and HttpOnly flags in production-like env", async () => {
  const email = `cookie${Date.now()}@example.com`;
  const password = "TestPass@123";

  const reg = await request(app).post("/api/v1/auth/register").send({
    email,
    password,
    confirmPassword: password,
    firstName: "C",
    lastName: "Test",
  });

  expect(reg.status).toBe(201);
  // The server sets refresh token both in JSON and as a cookie
  const setCookie = reg.header["set-cookie"]?.[0] || reg.headers?.["set-cookie"]?.[0];
  expect(setCookie).toBeTruthy();
  expect(/httponly/i.test(setCookie)).toBe(true);
  expect(/secure/i.test(setCookie)).toBe(true);
});
