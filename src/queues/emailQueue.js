import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { sendEmail } from '../config/mailer.js';

// 1. Declare Queue
export const emailQueue = new Queue('email-notifications', {
  connection: redisConnection,
});

// 2. Define Worker to process queued email jobs
export const emailWorker = new Worker(
  'email-notifications',
  async (job) => {
    const { to, subject, html } = job.data;
    await sendEmail({ to, subject, html });
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 emails concurrently
  }
);

// Worker Event Logging
emailWorker.on('completed', (job) => {
  console.log(`[Queue Success] Job ${job.id} (${job.name}) sent to ${job.data.to}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[Queue Error] Job ${job?.id} failed after attempts: ${err.message}`);
});