/**
 * BullMQ Job Queue
 * Implements scalable async job processing with priority, retry, and monitoring
 */

import { Queue, Worker, QueueEvents } from "bullmq";
import Redis from "ioredis";

interface JobConfig {
  attempts: number;
  backoff: {
    type: "exponential" | "fixed";
    delay: number;
  };
  removeOnComplete: boolean;
  removeOnFail: boolean;
}

interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  defaultJobConfig: JobConfig;
}

let redisConnection: Redis | null = null;
const queues = new Map<string, Queue>();
const workers = new Map<string, Worker>();
const queueEvents = new Map<string, QueueEvents>();

/**
 * Initialize Redis connection for queues
 */
function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return redisConnection;
}

/**
 * Get or create a queue
 */
export function getQueue(name: string): Queue {
  if (queues.has(name)) {
    return queues.get(name)!;
  }

  const queue = new Queue(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: parseInt(process.env.JOB_MAX_ATTEMPTS || "3", 10),
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  queues.set(name, queue);

  // Setup queue events
  const events = new QueueEvents(name, {
    connection: getRedisConnection(),
  });

  events.on("completed", ({ jobId }: any) => {
    console.log(`✅ Job ${jobId} completed`);
  });

  events.on("failed", ({ jobId, failedReason }: any) => {
    console.error(`❌ Job ${jobId} failed: ${failedReason}`);
  });

  queueEvents.set(name, events);

  return queue;
}

/**
 * Add job to queue
 */
export async function addJob<T>(
  queueName: string,
  jobName: string,
  data: T,
  options?: {
    priority?: number;
    delay?: number;
    attempts?: number;
  }
) {
  const queue = getQueue(queueName);

  return queue.add(jobName, data, {
    priority: options?.priority || 0,
    delay: options?.delay || 0,
    attempts: options?.attempts || 3,
  });
}

/**
 * Process jobs from queue
 */
export async function processQueue<T, R>(
  queueName: string,
  processor: (job: { data: T; id: string }) => Promise<R>
) {
  const queue = getQueue(queueName);

  const worker = new Worker(queueName, processor as any, {
    connection: getRedisConnection(),
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "5", 10),
  });

  worker.on("completed", (job: any) => {
    console.log(`✅ Worker completed job ${job.id}`);
  });

  worker.on("failed", (job: any, err: any) => {
    console.error(`❌ Worker failed job ${job?.id}: ${err.message}`);
  });

  workers.set(queueName, worker);

  return worker;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queueName: string) {
  const queue = getQueue(queueName);

  return {
    name: queueName,
    isPaused: await queue.isPaused(),
    count: await queue.count(),
    activeCount: await queue.getActiveCount(),
    waitingCount: await queue.getWaitingCount(),
    completedCount: await queue.getCompletedCount(),
    failedCount: await queue.getFailedCount(),
    delayedCount: await queue.getDelayedCount(),
  };
}

/**
 * Pause queue
 */
export async function pauseQueue(queueName: string) {
  const queue = getQueue(queueName);
  await queue.pause();
  console.log(`⏸️  Queue ${queueName} paused`);
}

/**
 * Resume queue
 */
export async function resumeQueue(queueName: string) {
  const queue = getQueue(queueName);
  await queue.resume();
  console.log(`▶️  Queue ${queueName} resumed`);
}

/**
 * Clear queue
 */
export async function clearQueue(queueName: string) {
  const queue = getQueue(queueName);
  await queue.clean(0, 1000);
  console.log(`🗑️  Queue ${queueName} cleared`);
}

/**
 * Get job by ID
 */
export async function getJob(queueName: string, jobId: string) {
  const queue = getQueue(queueName);
  return queue.getJob(jobId);
}

/**
 * Retry failed job
 */
export async function retryJob(queueName: string, jobId: string) {
  const queue = getQueue(queueName);
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  await job.retry();
  console.log(`🔄 Job ${jobId} retried`);
}

/**
 * Remove job
 */
export async function removeJob(queueName: string, jobId: string) {
  const queue = getQueue(queueName);
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  await job.remove();
  console.log(`❌ Job ${jobId} removed`);
}

/**
 * Get all queues statistics
 */
export async function getAllQueuesStats() {
  const stats: any[] = [];

  queues.forEach(async (queue, name) => {
    stats.push(await getQueueStats(name));
  });

  return stats;
}

/**
 * Close all queues and workers
 */
export async function closeQueues() {
  // Close workers
  workers.forEach(async (worker, name) => {
    await worker.close();
    console.log(`✅ Worker ${name} closed`);
  });
  workers.clear();

  // Close queue events
  queueEvents.forEach(async (events, name) => {
    await events.close();
    console.log(`✅ Queue events ${name} closed`);
  });
  queueEvents.clear();

  // Close queues
  queues.forEach(async (queue, name) => {
    await queue.close();
    console.log(`✅ Queue ${name} closed`);
  });
  queues.clear();

  // Close Redis connection
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    console.log("✅ Redis connection closed");
  }
}

/**
 * Workflow execution queue
 */
export const WORKFLOW_QUEUE = "workflow-execution";
export const WEBHOOK_QUEUE = "webhook-delivery";
export const NOTIFICATION_QUEUE = "notifications";
export const CLEANUP_QUEUE = "cleanup";

/**
 * Initialize default queues
 */
export async function initializeQueues() {
  getQueue(WORKFLOW_QUEUE);
  getQueue(WEBHOOK_QUEUE);
  getQueue(NOTIFICATION_QUEUE);
  getQueue(CLEANUP_QUEUE);

  console.log("✅ Default queues initialized");
}
