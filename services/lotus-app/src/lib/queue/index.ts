import { Queue } from 'bullmq';
import { QUEUE_NAME, QueueJob } from 'lotus-queue';

export const workerQueue = new Queue<QueueJob>(QUEUE_NAME);
