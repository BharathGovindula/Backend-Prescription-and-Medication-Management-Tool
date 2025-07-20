const redisClient = require('../redis');

class CacheService {
  async get(key) {
    return await redisClient.get(key);
  }

  async set(key, value, expireTime = 3600) {
    await redisClient.set(key, JSON.stringify(value), {
      EX: expireTime
    });
  }

  async delete(key) {
    await redisClient.del(key);
  }

  async invalidateUserCache(userId) {
    const keys = await redisClient.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}

module.exports = new CacheService(); 