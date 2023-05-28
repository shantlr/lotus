import { Resolvers } from '@/gql/__generated/resolversTypes';
import { prisma } from '@/lib/prisma';
import { GraphqlContext } from '../types';
import { UnauthenticatedError, UnauthorizedError } from '../util';
import { pickBy } from 'lodash';
import { diff } from '@/lib/utils/diff';
import { Prisma } from 'lotus-prisma';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    calendarEvent: async (root, { id }, context) => {
      if (!context.currentSession?.user) {
        throw new UnauthenticatedError();
      }

      const event = await prisma.event.findFirst({
        where: {
          id,
        },
      });
      if (event?.creator_id !== context.currentSession.user.id) {
        throw new UnauthorizedError();
      }
      return event;
    },
    calendarEvents: async (root, { input }, { currentSession: { user } }) => {
      if (!user) {
        return [];
      }
      const conds: Prisma.EventWhereInput[] = [
        {
          creator_id: user.id,
        },
      ];
      if (input?.start) {
        conds.push({
          end: {
            gt: input.start,
          },
        });
      }
      if (input?.end) {
        conds.push({
          start: {
            lt: input.end,
          },
        });
      }
      if (input?.labelIds?.length) {
        conds.push({
          userLabels: {
            some: {
              user_id: user.id,
              label_id: {
                in: input.labelIds,
              },
            },
          },
        });
      }
      const events = prisma.event.findMany({
        where: {
          AND: conds,
        },
        orderBy: [
          {
            start: 'asc',
          },
          {
            end: 'desc',
          },
        ],
      });
      return events;
    },
  },
  Mutation: {
    createCalendarEvent: async (
      root,
      { input: { endDate, startDate, title, labelIds } },
      { currentSession }
    ) => {
      const user = currentSession?.user;
      if (!user) {
        throw new UnauthenticatedError();
      }

      if (!labelIds.length) {
        throw new Error('MISSING_LABELID');
      }

      const labels = await prisma.label.findMany({
        where: {
          id: {
            in: labelIds,
          },
        },
      });
      if (labels.some((l) => l.creator_id !== user.id)) {
        throw new UnauthorizedError();
      }

      const event = await prisma.event.create({
        data: {
          title,
          start: startDate,
          end: endDate,
          creator_id: user.id,
          userLabels: {
            create: labelIds.map((labelId) => ({
              label_id: labelId,
              user_id: user.id,
            })),
          },
        },
      });

      return {
        event,
      };
    },
    updateCalendarEvent: async (
      root,
      { input: { id, title, startDate, endDate, labelIds } },
      { currentSession: { user } }
    ) => {
      if (!user) {
        throw new UnauthenticatedError();
      }
      const event = await prisma.event.findFirst({
        where: {
          id,
        },
      });
      if (!event) {
        throw new Error('INVALID_EVENT');
      }

      // TODO: transaction
      if (!title && !startDate && !endDate && !labelIds?.length) {
        return event;
      }

      return prisma.$transaction(async (p) => {
        //#region Labels
        if (labelIds?.length) {
          const existings = await p.userEventLabel.findMany({
            where: { event_id: event.id, user_id: user.id },
          });
          const { deleted, created } = diff(
            existings.map((e) => e.label_id),
            labelIds
          );
          if (deleted.length) {
            await p.userEventLabel.deleteMany({
              where: {
                label_id: {
                  in: deleted,
                },
                event_id: event.id,
                user_id: user.id,
              },
            });
          }
          if (created.length) {
            await p.userEventLabel.createMany({
              data: created.map((c) => ({
                event_id: event.id,
                user_id: user.id,
                label_id: c,
              })),
            });
          }
        }
        //#endregion

        const update = pickBy({ title, start: startDate, end: endDate });
        if (Object.keys(update).length) {
          const res = await prisma.event.update({
            where: { id },
            data: pickBy({ title, start: startDate, end: endDate }),
          });
          return res;
        }
        return event;
      });
    },
    deleteCalendarEvent: async (
      root,
      { input: { id } },
      { currentSession }
    ) => {
      if (!currentSession?.user) {
        throw new UnauthenticatedError();
      }

      const event = await prisma.event.findFirst({ where: { id } });
      if (!event) {
        throw new Error('INVALID_EVENT');
      }

      if (event.creator_id !== currentSession.user.id) {
        throw new UnauthorizedError();
      }

      await prisma.event.delete({ where: { id } });
      return true;
    },
  },
  CalendarEvent: {
    labels: (event, args, { currentSession }) => {
      const user = currentSession?.user;
      if (!user) {
        return [];
      }

      return prisma.label.findMany({
        where: {
          userEventLabels: {
            some: {
              user_id: user.id,
              event_id: event.id,
            },
          },
        },
      });
    },
    color: async (event, args, { currentSession: { user } }) => {
      const settings = await prisma.userEventLabel.findFirst({
        where: {
          event_id: event.id,
          user_id: user?.id,
        },
        include: {
          label: {
            include: {
              userSettings: {
                take: 1,
                where: {
                  user_id: user?.id,
                },
              },
            },
          },
        },
      });
      if (!settings) {
        throw new Error('MISSING_LABEL_SETTINGS');
      }
      return settings?.label.userSettings[0].color;
    },
    secondaryColor: async (event, args, { currentSession: { user } }) => {
      const settings = await prisma.userEventLabel.findFirst({
        where: {
          event_id: event.id,
          user_id: user?.id,
        },
        include: {
          label: {
            include: {
              userSettings: {
                take: 1,
                where: {
                  user_id: user?.id,
                },
              },
            },
          },
        },
      });
      if (!settings) {
        throw new Error('MISSING_LABEL_SETTINGS');
      }
      return settings?.label.userSettings[0].secondary_color;
    },
  },
};
