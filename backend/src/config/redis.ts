import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 2) {
        return new Error('Redis connection failed');
      }
      return 500;
    }
  }
});

redisClient.on('error', (err) => {
  if ((err as any)?.code === 'ECONNREFUSED' || (err as any)?.errors) return;
  console.log('Redis Client Notice:', err.message || err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log('⚡️[server]: Connected to Redis successfully');
    } catch (e) {
      console.warn('⚠️ Running server without Redis caching.');
    }
  }
};

export default redisClient;
