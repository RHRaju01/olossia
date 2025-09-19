import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const VERIFY_EMAIL_SECRET =
  process.env.VERIFY_EMAIL_SECRET ||
  process.env.JWT_REFRESH_SECRET ||
  "verify-dev-secret";
const VERIFY_EMAIL_EXPIRES_IN = process.env.VERIFY_EMAIL_EXPIRES_IN || "1d";

export function signEmailToken(payload) {
  return jwt.sign(payload, VERIFY_EMAIL_SECRET, {
    expiresIn: VERIFY_EMAIL_EXPIRES_IN,
  });
}

export function verifyEmailToken(token) {
  try {
    return jwt.verify(token, VERIFY_EMAIL_SECRET);
  } catch (err) {
    return null;
  }
}

export default { signEmailToken, verifyEmailToken };
