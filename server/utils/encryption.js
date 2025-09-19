import bcrypt from "bcryptjs";
import crypto from "crypto";

// Configure bcrypt rounds via env var or default to 12
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export const hashPassword = async (password) => {
  if (!password) throw new Error("Password is required");
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

export const verifyPassword = async (password, hash) => {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
};

// Refresh token hashing: require REFRESH_TOKEN_PEPPER (defense-in-depth)
const getRefreshTokenPepper = () => process.env.REFRESH_TOKEN_PEPPER || "";

export const hashRefreshToken = (token) => {
  const pepper = getRefreshTokenPepper();
  if (!pepper) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing REFRESH_TOKEN_PEPPER in environment (required in production)"
      );
    }
    // In development fallback to JWT_REFRESH_SECRET for convenience but warn
    const fallback = process.env.JWT_REFRESH_SECRET || "";
    if (!fallback) {
      throw new Error(
        "Missing REFRESH_TOKEN_PEPPER or JWT_REFRESH_SECRET in environment"
      );
    }
    return crypto.createHmac("sha256", fallback).update(token).digest("hex");
  }

  return crypto.createHmac("sha256", pepper).update(token).digest("hex");
};

export const compareRefreshToken = (token, tokenHash) => {
  if (!token || !tokenHash) return false;
  const computed = hashRefreshToken(token);
  try {
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(tokenHash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
};

export default {
  hashPassword,
  verifyPassword,
  hashRefreshToken,
  compareRefreshToken,
};
