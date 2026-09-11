import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from './logger';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

// BullMQ requires maxRetriesPerRequest to be null
export const redisConnection = new IORedis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
});

export const imageProcessingQueueName = 'image-processing-queue';

// Create a singleton instance of the queue
declare global {
  var _imageProcessingQueue: Queue | undefined;
}

export const imageProcessingQueue = global._imageProcessingQueue || new Queue(imageProcessingQueueName, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

if (process.env.NODE_ENV !== 'production') {
  global._imageProcessingQueue = imageProcessingQueue;
}
