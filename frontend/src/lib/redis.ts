import Redis from 'ioredis';

// Initialize Redis client
const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not defined');
  }
  
  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      // Exponential backoff with a maximum delay of 5 seconds
      const delay = Math.min(times * 100, 5000);
      return delay;
    },
  });
};

// Create a singleton instance
let redisClient: Redis | null = null;

export const getRedis = () => {
  if (!redisClient) {
    redisClient = getRedisClient();
  }
  return redisClient;
};

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGTERM', () => {
    if (redisClient) {
      redisClient.disconnect();
    }
  });
}
