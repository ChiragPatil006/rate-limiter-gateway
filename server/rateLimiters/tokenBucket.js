const redisClient = require('../config/redisClient');

const BUCKET_CAPACITY = 5;       // max tokens
const REFILL_RATE = 5 / 60;      // tokens added per second (5 tokens per 60 sec)

// Lua script: runs atomically inside Redis
const luaScript = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refillRate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])

  local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
  local tokens = tonumber(bucket[1])
  local lastRefill = tonumber(bucket[2])

  if tokens == nil then
    tokens = capacity
    lastRefill = now
  end

  local elapsed = now - lastRefill
  local refillAmount = elapsed * refillRate
  tokens = math.min(capacity, tokens + refillAmount)
  lastRefill = now

  local allowed = 0
  if tokens >= 1 then
    tokens = tokens - 1
    allowed = 1
  end

  redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
  redis.call('EXPIRE', key, 3600)

  return allowed
`;

const isAllowedTokenBucket = async (apiKey) => {
  const redisKey = `ratelimit:token:${apiKey}`;
  const now = Date.now() / 1000; // convert to seconds

  const result = await redisClient.eval(
    luaScript,
    1,              // number of KEYS
    redisKey,       // KEYS[1]
    BUCKET_CAPACITY,// ARGV[1]
    REFILL_RATE,    // ARGV[2]
    now             // ARGV[3]
  );

  return result === 1;
};

module.exports = isAllowedTokenBucket;