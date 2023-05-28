import { Worker } from 'bullmq';
import { QUEUE_NAME, QueueJob } from 'lotus-queue';
import { syncExternalCalendar } from './handlers/syncExternalCalendar';

const worker = new Worker<QueueJob, void>(
  QUEUE_NAME,
  async (job) => {
    const { data } = job;
    switch (data.type) {
      case 'sync-external-calendar': {
        return await syncExternalCalendar(job);
      }
      default:
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  }
);

worker.on('active', (job) => {
  console.log(`[job-active] id='${job.id}' name='${job.name}'`);
});
worker.on('failed', (job, err) => {
  console.log(`[job-failed] id='${job.id}' name='${job.name}'`, err);
});
worker.on('error', (err) => {
  console.log(`[job-error]`, err);
  console.log('ERR', err);
});
worker.on('completed', (job) => {
  console.log(`[job-completed] id='${job.id}' name='${job.name}'`);
});
