import { Resolvers } from '@/gql/__generated/resolversTypes';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { GraphqlContext } from '../types';
import { UnauthenticatedError, UnauthorizedError } from '../util';
import { pickBy } from 'lodash';

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
    tasks: async (root, { input }, context) => {
      if (!context.currentSession?.user) {
        return [];
      }
      const conds: Prisma.TaskWhereInput[] = [
        {
          creator_id: context.currentSession.user.id,
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
      { input: { id, title, startDate, endDate } },
      { currentSession }
    ) => {
      if (!currentSession?.user) {
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

      const res = await prisma.task.update({
        where: { id },
        data: pickBy({ title, start: startDate, end: endDate }),
        select: { id: true, start: true, end: true, title: true },
      });
      return res;
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
  },
};
