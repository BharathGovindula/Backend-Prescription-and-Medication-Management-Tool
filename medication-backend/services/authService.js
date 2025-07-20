const jwt = require('jsonwebtoken');
const config = require('../config');
const redisClient = require('../redis');

class AuthService {
  generateTokens(userId, role) {
    const accessToken = jwt.sign(
      { userId, role },
      config.jwt.secret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId, refreshToken) {
    await redisClient.set(`refresh:${userId}`, refreshToken, {
      EX: 7 * 24 * 60 * 60 // 7 days
    });
  }

  async validateRefreshToken(userId, refreshToken) {
    const storedToken = await redisClient.get(`refresh:${userId}`);
    return storedToken === refreshToken;
  }
}

module.exports = new AuthService(); 