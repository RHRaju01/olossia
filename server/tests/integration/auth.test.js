import request from "supertest";
import app from "../../app.js";
import { startServer } from "../../server.js";

let server;

// Increase Jest timeout for slow CI/dev environments (server startup, network)
jest.setTimeout(30000);

beforeAll(async () => {
  // Ensure env defaults for testing
  process.env.REFRESH_TOKEN_PEPPER =
    process.env.REFRESH_TOKEN_PEPPER || "pepper123";
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "jwtrefreshsecret";
  process.env.VERIFY_EMAIL_SECRET =
    process.env.VERIFY_EMAIL_SECRET || "verifysecret";
  process.env.AUTO_VERIFY_NEW_USERS = "true"; // speed up tests
  server = await startServer(0); // pick a free port
  const addr = server.address();
  const actualPort = addr && addr.port ? addr.port : process.env.PORT || 5000;
  // set BASE URL for supertest to use if needed (app is used directly)
  process.env.TEST_SERVER_PORT = actualPort;
});

afterAll(async () => {
  if (server && server.close) await new Promise((res) => server.close(res));
  // clear prune job if attached
  if (server && server.pruneJob) clearInterval(server.pruneJob);
});

describe("Auth integration", () => {
  test("register -> login -> refresh -> logout", async () => {
    const email = `itest+${Date.now()}@example.com`;
    const password = "Str0ng@Pass!";

    // register
    const reg = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      confirmPassword: password,
      firstName: "IT",
      lastName: "Test",
    });
    expect(reg.status).toBe(201);
    expect(reg.body.success).toBe(true);
    const refreshToken = reg.body.data.refreshToken;
    expect(refreshToken).toBeTruthy();

    // login
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.success).toBe(true);
    const loginRefresh = login.body.data.refreshToken;
    expect(loginRefresh).toBeTruthy();
    // assert HttpOnly refresh cookie is set on login
    const loginSetCookie =
      login.header["set-cookie"] || login.headers["set-cookie"];
    expect(loginSetCookie).toBeDefined();
    const cookieJoined = Array.isArray(loginSetCookie)
      ? loginSetCookie.join(";")
      : String(loginSetCookie);
    expect(cookieJoined).toMatch(
      new RegExp(`${process.env.REFRESH_COOKIE_NAME || "refreshToken"}=`)
    );
    expect(cookieJoined.toLowerCase()).toContain("httponly");

    // refresh
    const ref = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: loginRefresh });
    expect(ref.status).toBe(200);
    expect(ref.body.success).toBe(true);
    const newRefresh = ref.body.data.refreshToken;
    expect(newRefresh).toBeTruthy();
    // assert HttpOnly refresh cookie is set on refresh rotation
    const refSetCookie = ref.header["set-cookie"] || ref.headers["set-cookie"];
    expect(refSetCookie).toBeDefined();
    const refCookieJoined = Array.isArray(refSetCookie)
      ? refSetCookie.join(";")
      : String(refSetCookie);
    expect(refCookieJoined).toMatch(
      new RegExp(`${process.env.REFRESH_COOKIE_NAME || "refreshToken"}=`)
    );
    expect(refCookieJoined.toLowerCase()).toContain("httponly");

    // logout
    const lo = await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken: newRefresh });
    expect(lo.status).toBe(200);
    expect(lo.body.success).toBe(true);
  }, 20000);
});
