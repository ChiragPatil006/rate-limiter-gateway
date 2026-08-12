const redisClient = require('../config/redisClient');

const WINDOW_SIZE_SECONDS = 60; // 1 minute window
const MAX_REQUESTS = 5;         // 5 requests allowed per window

const isAllowedFixedWindow = async (apiKey) => {
  // 1. Figure out which "window" we're currently in
  const currentWindow = Math.floor(Date.now() / 1000 / WINDOW_SIZE_SECONDS);

  // 2. Build a Redis key unique to this user AND this specific window
  const redisKey = `ratelimit:fixed:${apiKey}:${currentWindow}`;

  // 3. Atomically increment the counter (creates it at 1 if it doesn't exist yet)
  const currentCount = await redisClient.incr(redisKey);

  // 4. If this is the first request in this window, set it to expire automatically
  if (currentCount === 1) {
    await redisClient.expire(redisKey, WINDOW_SIZE_SECONDS);
  }

  // 5. Allow if we're still under the limit
  return currentCount <= MAX_REQUESTS;
};

module.exports = isAllowedFixedWindow;