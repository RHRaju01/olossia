import argon2 from "argon2";
import crypto from "crypto";

/*
  Argon2id password hashing
  - Uses the argon2 library with argon2id variant.
  - Parameters can be tuned via env vars for memoryCost (KiB), timeCost (iterations)
    and parallelism. Defaults are chosen conservatively for typical CI/dev machines.
*/
// Use lighter Argon2 settings in test environments to keep Jest fast.
const isTest = process.env.NODE_ENV === "test";
// Production-recommended defaults (tunable via env):
// - memoryCost in KiB (128 MiB = 131072 KiB)
// - timeCost (iterations)
// - parallelism (threads)
const ARGON_MEMORY_COST = parseInt(
  process.env.ARGON_MEMORY_COST || (isTest ? "16384" : "131072"),
  10
); // KiB: default 128 MiB in production, 16 MiB in tests
// argon2 requires timeCost >= 2
const ARGON_TIME_COST = parseInt(
  process.env.ARGON_TIME_COST || (isTest ? "2" : "4"),
  10
);
const ARGON_PARALLELISM = parseInt(
  process.env.ARGON_PARALLELISM || (isTest ? "1" : "2"),
  10
);

export const hashPassword = async (password) => {
  if (!password) throw new Error("Password is required");
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: ARGON_MEMORY_COST,
    timeCost: ARGON_TIME_COST,
    parallelism: ARGON_PARALLELISM,
  });
};

export const verifyPassword = async (password, hash) => {
  if (!password || !hash) return false;
  try {
    return await argon2.verify(hash, password);
  } catch (e) {
    // argon2.verify throws on malformed hashes; return false for safety
    return false;
  }
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
