import jwt from 'jsonwebtoken';

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '15m', // Access token expires in 15 minutes
  refreshExpiresIn: '7d' // Refresh token expires in 7 days
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.refreshExpiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.secret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.secret);
};