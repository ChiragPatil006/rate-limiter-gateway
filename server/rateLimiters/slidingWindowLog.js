const redisClient = require('../config/redisClient');

const WINDOW_SIZE_SECONDS = 60;
const MAX_REQUESTS = 5;

const isAllowedSlidingWindow = async (apiKey) => {
  const redisKey = `ratelimit:sliding:${apiKey}`;
  const now = Date.now(); // current time in milliseconds
  const windowStart = now - WINDOW_SIZE_SECONDS * 1000;

  // 1. Remove timestamps older than our window (they're no longer relevant)
  await redisClient.zremrangebyscore(redisKey, 0, windowStart);

  // 2. Count how many timestamps are left inside the current window
  const requestCount = await redisClient.zcard(redisKey);

  if (requestCount < MAX_REQUESTS) {
    // 3. Allowed — record this request's timestamp
    await redisClient.zadd(redisKey, now, `${now}-${Math.random()}`);
    await redisClient.expire(redisKey, WINDOW_SIZE_SECONDS);
    return true;
  }

  return false;
};

module.exports = isAllowedSlidingWindow;