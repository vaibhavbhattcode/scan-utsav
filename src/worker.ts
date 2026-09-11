import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import mongoose from 'mongoose';
import { logger } from './lib/logger';
import Media from './models/Media';
import dotenv from 'dotenv';
dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');
const pythonAiUrl = process.env.PYTHON_FACE_AI_URL || 'http://localhost:5000';
const mongoUri = process.env.MONGODB_URI || '';

const connection = new IORedis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
});

async function processImageJob(job: Job) {
  const { mediaId, eventId, mediaUrl } = job.data;
  logger.info(`[Worker] Processing job ${job.id} for media ${mediaId}`);

  try {
    // Call the Python AI Service to process the image and save to FAISS
    const response = await fetch(`${pythonAiUrl}/process-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mediaId,
        eventId,
        mediaUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    // Result should contain extracted faces: { success: true, faces: [{ embedding: [...], box: [...], det_score: 0.99 }] }
    if (result.success && result.faces) {
      let tags = new Set<string>();

      const mappedFaces = result.faces.map((f: any) => {
        if (f.gender && f.gender !== "unknown") tags.add(f.gender);
        if (f.age > 0) {
          if (f.age < 12) tags.add("child");
          else if (f.age < 20) tags.add("teen");
          else if (f.age < 60) tags.add("adult");
          else tags.add("senior");
        }
        return {
          embedding: f.embedding,
          box: f.box,
          detScore: f.detScore || f.det_score
        };
      });

      await Media.findByIdAndUpdate(mediaId, {
        aiProcessingStatus: 'completed',
        faceCount: mappedFaces.length,
        faces: mappedFaces,
        $addToSet: { aiTags: { $each: Array.from(tags) } }
      });
      logger.info(`[Worker] Successfully processed media ${mediaId} with ${mappedFaces.length} faces and tags: ${Array.from(tags).join(', ')}`);
    } else {
      throw new Error('Invalid response format from Python API');
    }

  } catch (error: any) {
    logger.error(`[Worker] Job ${job.id} failed:`, error.message);
    
    // Update DB status to failed if all attempts are exhausted
    if (job.attemptsMade >= (job.opts.attempts || 1) - 1) {
       await Media.findByIdAndUpdate(mediaId, {
         aiProcessingStatus: 'failed'
       });
    }
    throw error;
  }
}

async function startWorker() {
  logger.info('[Worker] Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  logger.info('[Worker] Connected to MongoDB.');

  logger.info('[Worker] Starting BullMQ Worker...');
  const worker = new Worker('image-processing-queue', processImageJob, { connection });

  worker.on('completed', (job) => {
    logger.info(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
  });
}

startWorker().catch((err) => {
  logger.error('[Worker] Fatal error:', err);
  process.exit(1);
});
