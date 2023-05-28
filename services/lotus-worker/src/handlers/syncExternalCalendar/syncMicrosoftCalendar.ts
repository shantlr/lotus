import { Client } from '@microsoft/microsoft-graph-client';
import 'cross-fetch/polyfill';
import { Account, Event, Label } from 'lotus-prisma';
import { diff } from 'lotus-common/utils';
import { getRandomLabelColor } from 'lotus-common/label';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  MicrosoftCalendar,
  MicrosoftCalendarEvent,
  MicrosoftCalendarGroup,
} from './types';
import { prisma } from '../../lib/prisma';

const PROVIDER = 'azure-ad';

dayjs.extend(utc);

const parseDate = (str?: string, timeZone?: string) => {
  if (!str) {
    return null;
  }
  if (timeZone === 'UTC') {
    return dayjs.utc(str).toDate();
  }
  return new Date(str);
};

export const mapMicrosoftEventToLotusEvent = (
  event: MicrosoftCalendarEvent
) => {
  const res: Omit<
    Event,
    | 'id'
    | 'creator_id'
    | 'created_at'
    | 'updated_at'
    | 'external_provider_account_id'
  > &
    Partial<Pick<Event, 'created_at' | 'updated_at'>> = {
    title: event.subject,
    external_provider: PROVIDER,
    external_id: event.id,
    start: parseDate(event.start?.dateTime, event.start?.timeZone),
    end: parseDate(event.end?.dateTime, event.end?.timeZone),
  };

  if (event.createdDateTime) {
    res.created_at = new Date(event.createdDateTime);
  }
  if (event.lastModifiedDateTime) {
    res.updated_at = new Date(event.lastModifiedDateTime);
  }
  return res;
};

const syncCalendars = async ({
  userId,
  calendars,
  providerAccountId,
}: {
  userId: string;
  providerAccountId: string;
  calendars: MicrosoftCalendar[];
}): Promise<{
  [calendarId: string]: Label;
}> => {
  const existings = await prisma.label.findMany({
    where: {
      creator_id: userId,
      external_provider: PROVIDER,
      external_provider_account_id: providerAccountId,
    },
  });

  const { updated, news, missings, unchanged } = diff(
    existings,
    calendars,
    (label, cal) => {
      return label.external_id === cal.id;
    },
    (label, cal) => label.name !== cal.name
  );

  const labelMap = unchanged.reduce((acc, { prev }) => {
    acc[prev.external_id] = prev;
    return acc;
  }, {} as Record<string, Label>);

  if (news.length || updated.length || missings.length) {
    console.log({
      existings,
      calendars,
      news,
      updated,
      missings,
    });
    const res = await prisma.$transaction(
      [
        ...news.map((cal) => {
          const color = getRandomLabelColor();
          return prisma.label.create({
            data: {
              name: cal.name,
              assignable: false,
              external_id: cal.id,
              external_provider: PROVIDER,
              external_provider_account_id: providerAccountId,
              creator_id: userId,
              userSettings: {
                create: {
                  user_id: userId,
                  color: color.bg,
                  secondary_color: color.outline,
                },
              },
            },
          });
        }),
        ...updated.map(({ prev, next }) =>
          prisma.label.update({
            where: {
              id: prev.id,
            },
            data: {
              name: next.name,
            },
          })
        ),
        // TODO: delete missings
        // delete associated settings
        // delete associated events
        // ...missings.forEach(m => ({
        // }))
      ].filter((u) => u)
    );
    res.forEach((label) => {
      labelMap[label.external_id] = label;
    });
  }

  console.log(
    `[sync-microsoft-calendars] ${unchanged.length} unchanged(s) | ${news.length} new(s) | ${updated.length} updated(s) | ${missings.length} missing(s) calendars for account '${providerAccountId}'`
  );

  return labelMap;
};

const syncEvents = async ({
  events: microsoftEvents,
  label,
  userId,
  providerAccountId,
}: {
  events: MicrosoftCalendarEvent[];
  label: Label;
  userId: string;
  providerAccountId: string;
}) => {
  const events = microsoftEvents.map(mapMicrosoftEventToLotusEvent);

  const existings = await prisma.event.findMany({
    where: {
      creator_id: userId,
      external_provider: PROVIDER,
      external_provider_account_id: providerAccountId,
      userLabels: {
        some: {
          user_id: userId,
          label_id: label.id,
        },
      },
    },
  });

  const { unchanged, news, updated, missings } = diff(
    existings,
    events,
    (prev, e) => prev.external_id === e.external_id,
    (prev, e) =>
      prev.start?.valueOf() !== e.start?.valueOf() ||
      prev.end?.valueOf() !== e.end?.valueOf() ||
      prev.title !== e.title ||
      prev.created_at?.valueOf() !== e.created_at?.valueOf()
  );

  if (news.length || updated.length || missings.length) {
    await prisma.$transaction(
      [
        ...news.map((e) =>
          prisma.event.create({
            data: {
              ...e,
              creator_id: userId,
              external_provider_account_id: providerAccountId,
              userLabels: {
                create: [
                  {
                    user_id: userId,
                    label_id: label.id,
                  },
                ],
              },
            },
          })
        ),
        ...updated.map((u) =>
          prisma.event.update({
            where: {
              id: u.prev.id,
            },
            data: {
              title: u.next.title,
              start: u.next.start,
              end: u.next.end,
              created_at: u.next.created_at,
            },
          })
        ),
        missings.length > 0 &&
          prisma.event.deleteMany({
            where: {
              id: {
                in: missings.map((e) => e.id),
              },
            },
          }),
      ].filter((u) => u)
    );
  }
  console.log(
    `[sync-microsoft-calendar-event] ${unchanged.length} unchanged | ${news.length} news | ${updated.length} updated | ${missings.length} missings events for calendar_id='${label.external_id}' | account='${providerAccountId}'`
  );
};

export const syncMicrosoftCalendars = async (account: Account) => {
  const client = Client.init({
    authProvider: (done) => done(null, account.access_token),
  });

  try {
    const { value: calendarGroups } = (await client
      .api('/me/calendarGroups')
      .get()) as {
      value: MicrosoftCalendarGroup[];
    };

    const calendars: (MicrosoftCalendar & { groupId: string })[] = [];
    for (const group of calendarGroups) {
      const { value } = (await client
        .api(`/me/calendarGroups/${group.id}/calendars`)
        .get()) as {
        value: MicrosoftCalendar[];
      };
      calendars.push(...value.map((v) => ({ ...v, groupId: group.id })));
    }

    const labelByCalendarId = await syncCalendars({
      userId: account.userId,
      providerAccountId: account.providerAccountId,
      calendars: calendars,
    });

    for (const calendar of calendars) {
      const label = labelByCalendarId[calendar.id];
      if (!label) {
        throw new Error(
          `Calendar '${calendar.id}' corresponding label not found`
        );
      }

      const { value: events } = (await client
        .api(
          `/me/calendarGroups/${calendar.groupId}/calendars/${calendar.id}/events`
        )
        .get()) as {
        value: MicrosoftCalendarEvent[];
      };

      await syncEvents({
        events,
        label,
        providerAccountId: account.providerAccountId,
        userId: account.userId,
      });
    }
  } catch (err) {
    if (err.statusCode === 401) {
      console.warn(
        `account '${account.id}' provider='${account.provider}' access_token expired`
      );
      return;
    }
    console.log(err);
  }
};
