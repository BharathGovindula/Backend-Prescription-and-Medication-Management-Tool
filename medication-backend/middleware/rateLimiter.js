const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../redis');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// NOTE: Relaxed for development. Revert before deploying to production!
module.exports = {
  authLimiter: createLimiter(1 * 60 * 1000, 100, 'Too many auth attempts, please try again later.'), // 100 attempts per minute
  apiLimiter: createLimiter(60 * 1000, 100, 'Too many requests, please try again later.'),
  userActionLimiter: createLimiter(60 * 1000, 100, 'Too many actions, please slow down.')
}; 