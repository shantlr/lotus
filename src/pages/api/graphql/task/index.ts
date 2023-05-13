import { Resolvers } from '@/gql/__generated/resolversTypes';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { GraphqlContext } from '../types';
import { UnauthenticatedError, UnauthorizedError } from '../util';
import { pickBy } from 'lodash';
import { diff } from '@/lib/utils/diff';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    task: async (root, { id }, context) => {
      if (!context.currentSession?.user) {
        throw new UnauthenticatedError();
      }

      const task = await prisma.task.findFirst({
        where: {
          id,
        },
      });
      if (task?.creator_id !== context.currentSession.user.id) {
        throw new UnauthorizedError();
      }

      return task;
    },
    tasks: async (root, { input }, { currentSession: { user } }) => {
      if (!user) {
        return [];
      }
      const conds: Prisma.TaskWhereInput[] = [
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
      const tasks = prisma.task.findMany({
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
      return tasks;
    },
  },
  Mutation: {
    createTask: async (
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

      const task = await prisma.task.create({
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
        task,
      };
    },
    updateTask: async (
      root,
      { input: { id, title, startDate, endDate, labelIds } },
      { currentSession: { user } }
    ) => {
      if (!user) {
        throw new UnauthenticatedError();
      }
      const task = await prisma.task.findFirst({
        where: {
          id,
        },
      });
      if (!task) {
        throw new Error('INVALID_TASK');
      }

      // TODO: transaction
      if (!title && !startDate && !endDate && !labelIds?.length) {
        return task;
      }

      return prisma.$transaction(async (p) => {
        //#region Labels
        if (labelIds?.length) {
          const existings = await p.userTaskLabel.findMany({
            where: { task_id: task.id, user_id: user.id },
          });
          const { deleted, created } = diff(
            existings.map((e) => e.label_id),
            labelIds
          );
          if (deleted.length) {
            await p.userTaskLabel.deleteMany({
              where: {
                label_id: {
                  in: deleted,
                },
                task_id: task.id,
                user_id: user.id,
              },
            });
          }
          if (created.length) {
            await p.userTaskLabel.createMany({
              data: created.map((c) => ({
                task_id: task.id,
                user_id: user.id,
                label_id: c,
              })),
            });
          }
        }
        //#endregion

        const update = pickBy({ title, start: startDate, end: endDate });
        if (Object.keys(update).length) {
          const res = await prisma.task.update({
            where: { id },
            data: pickBy({ title, start: startDate, end: endDate }),
            select: { id: true, start: true, end: true, title: true },
          });
          return res;
        }
        return task;
      });
    },
    deleteTask: async (root, { input: { id } }, { currentSession }) => {
      if (!currentSession?.user) {
        throw new UnauthenticatedError();
      }

      const task = await prisma.task.findFirst({ where: { id } });
      if (!task) {
        throw new Error('INVALID_TASK');
      }

      if (task.creator_id !== currentSession.user.id) {
        throw new UnauthorizedError();
      }

      await prisma.task.delete({ where: { id } });
      return true;
    },
  },
  Task: {
    labels: (task, args, { currentSession }) => {
      const user = currentSession?.user;
      if (!user) {
        return [];
      }

      return prisma.label.findMany({
        where: {
          userTaskLabels: {
            some: {
              user_id: user.id,
              task_id: task.id,
            },
          },
        },
      });
    },
    color: async (task, args, { currentSession }) => {
      const settings = await prisma.userTaskLabel.findFirst({
        where: {
          task_id: task.id,
          user_id: currentSession.user?.id,
        },
        include: {
          label: {
            include: {
              userSettings: {
                take: 1,
                where: {
                  user_id: currentSession.user?.id,
                },
              },
            },
          },
        },
      });
      return settings?.label.userSettings[0].color;
    },
    secondaryColor: async (task, args, { currentSession }) => {
      const settings = await prisma.userTaskLabel.findFirst({
        where: {
          task_id: task.id,
          user_id: currentSession.user?.id,
        },
        include: {
          label: {
            include: {
              userSettings: {
                take: 1,
                where: {
                  user_id: currentSession.user?.id,
                },
              },
            },
          },
        },
      });
      return settings?.label.userSettings[0].secondary_color;
    },
  },
};
