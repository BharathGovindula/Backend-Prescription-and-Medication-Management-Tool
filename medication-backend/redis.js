const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: process.env.REDIS_URL && process.env.REDIS_URL.startsWith('rediss://'),
    rejectUnauthorized: false // Upstash public certs
  }
});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();

module.exports = client; 