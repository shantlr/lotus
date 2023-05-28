export const QUEUE_NAME = '@lotus/jobs';

export type QueueJob = {
  type: 'sync-external-calendar';
  account_id: string;
};
