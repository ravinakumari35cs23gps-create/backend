const jwt = require('jsonwebtoken');

/**
 * Generate Access Token
 */
const generateAccessToken = (userId, role, tokenVersion = 0) => {
  return jwt.sign(
    { userId, role, tokenVersion },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId, tokenVersion = 0) => {
  return jwt.sign(
    { userId, tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate Token Pair
 */
const generateTokenPair = (userId, role, tokenVersion = 0) => {
  return {
    accessToken: generateAccessToken(userId, role, tokenVersion),
    refreshToken: generateRefreshToken(userId, tokenVersion),
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
