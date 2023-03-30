import { Resolvers } from '@/gql/__generated/resolversTypes';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { GraphqlContext } from '../types';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
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
        orderBy: {
          start: 'asc',
        },
      });
      return tasks;
    },
  },
  Mutation: {
    createTask: async (
      root,
      { input: { endDate, startDate, title } },
      { currentSession }
    ) => {
      if (!currentSession?.user) {
        throw new Error('UNAUTHENTICATED');
      }
      const task = await prisma.task.create({
        data: {
          title,
          start: startDate,
          end: endDate,
          creator_id: currentSession.user?.id,
        },
      });

      return {
        task,
      };
    },
  },
};
