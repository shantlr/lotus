import { Queue } from 'bullmq';
import { Account } from 'lotus-prisma';
import { QUEUE_NAME, QueueJob } from 'lotus-queue';
import { prisma } from '../prisma';

export const jobQueue = new Queue<QueueJob>(QUEUE_NAME);

export const createSyncExternalCalendarJob = async ({
  provider,
  providerAccountId,
}: {
  provider: string;
  providerAccountId: string;
}) => {
  const account = await prisma.account.findFirst({
    where: {
      provider,
      providerAccountId,
    },
  });
  if (account) {
    await jobQueue.add(`sync-external-calendar-jobs:${account.id}`, {
      type: 'sync-external-calendar',
      account_id: account.id,
    });
  } else {
    console.warn(
      `[create-sync-external-calendar-job] account provider=${provider} provider_account_id=${providerAccountId} not found`
    );
  }
};
