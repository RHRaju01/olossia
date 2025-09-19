import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET || null;
// Support standard env name JWT_EXPIRES_IN (e.g. '15m', '7d')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

// Fail fast in production if no JWT secret is provided
if (process.env.NODE_ENV === "production" && !JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production environment");
}

// For local development provide a dev secret to keep DX smooth
const EFFECTIVE_JWT_SECRET = JWT_SECRET || process.env.SECRET || "dev-secret";

export const signAccessToken = (user) => {
  const payload = {
    sub: user.id,
    role: user.role || user.role_id || "customer",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw err;
  }
};

export const generateRandomToken = (size = 48) => {
  // generate base64url token (shorter than hex for same entropy)
  const buf = crypto.randomBytes(size);
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export default { signAccessToken, verifyAccessToken, generateRandomToken };
