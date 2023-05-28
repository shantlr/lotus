import { Job } from 'bullmq';
import { QueueJob } from 'lotus-queue';

import { prisma } from '../../lib/prisma';
import { syncMicrosoftCalendars } from './syncMicrosoftCalendar';

export const syncExternalCalendar = async ({
  data,
}: Job<QueueJob & { type: 'sync-external-calendar' }>) => {
  console.log(`[sync-external-calendar-outlook]`);
  const account = await prisma.account.findFirst({
    where: {
      id: data.account_id,
    },
  });
  if (account.provider === 'azure-ad') {
    await syncMicrosoftCalendars(account);
  } else {
    console.warn(
      `[sync-external-calendar] ${account.provider} unimplemented !`
    );
  }
};
