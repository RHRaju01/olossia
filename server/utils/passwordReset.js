import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const PASSWORD_RESET_SECRET =
  process.env.PASSWORD_RESET_SECRET ||
  process.env.VERIFY_EMAIL_SECRET ||
  process.env.JWT_REFRESH_SECRET ||
  "password-reset-dev-secret";
const PASSWORD_RESET_EXPIRES_IN = process.env.PASSWORD_RESET_EXPIRES_IN || "1h";

export function signPasswordResetToken(payload) {
  return jwt.sign(payload, PASSWORD_RESET_SECRET, {
    expiresIn: PASSWORD_RESET_EXPIRES_IN,
  });
}

export function verifyPasswordResetToken(token) {
  try {
    return jwt.verify(token, PASSWORD_RESET_SECRET);
  } catch (err) {
    return null;
  }
}

export default { signPasswordResetToken, verifyPasswordResetToken };
