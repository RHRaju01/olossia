import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
};

export const SALT_ROUNDS = 12;

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, { 
    expiresIn: JWT_CONFIG.expiresIn 
  });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.refreshSecret, { 
    expiresIn: JWT_CONFIG.refreshExpiresIn 
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.secret);
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.refreshSecret);
};

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};