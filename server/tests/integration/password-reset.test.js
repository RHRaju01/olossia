import request from "supertest";
import app from "../../app.js";
import { startServer } from "../../server.js";

// Increase Jest timeout for slow CI/dev environments (server startup, network)
jest.setTimeout(30000);

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
  if (server && server.close) await new Promise((res) => server.close(res));
  if (server && server.pruneJob) clearInterval(server.pruneJob);
});

describe("Password reset flow", () => {
  test("request and confirm password reset", async () => {
    const email = `ptest+${Date.now()}@example.com`;
    const password = "OldPass@123";
    const newPassword = "NewPass@123";

    // register user
    const reg = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      confirmPassword: password,
      firstName: "PR",
      lastName: "Test",
    });
    expect(reg.status).toBe(201);

    // request reset
    const reqRes = await request(app)
      .post("/api/v1/auth/password-reset/request")
      .send({ email });
    expect(reqRes.status).toBe(200);
    // previewUrl included in response (Ethereal) in dev
    const previewUrl = reqRes.body.previewUrl || reqRes.body.data?.previewUrl;
    expect(previewUrl).toBeTruthy();

    // fetch the preview URL and extract link with token
    const fetchRes = await fetch(previewUrl);
    const html = await fetchRes.text();
    const match = html.match(/reset-password\?token=([A-Za-z0-9-_\.]+)/);
    expect(match).toBeTruthy();
    const token = match[1];

    // confirm reset
    const conf = await request(app)
      .post("/api/v1/auth/password-reset/confirm")
      .send({ token, newPassword });
    expect(conf.status).toBe(200);

    // now login with new password
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: newPassword });
    expect(login.status).toBe(200);
  }, 30000);
});
