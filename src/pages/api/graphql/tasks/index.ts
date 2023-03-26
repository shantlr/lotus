import { Resolvers } from '@/gql/__generated/resolversTypes';
import { prisma } from '@/lib/prisma';
import { GraphqlContext } from '../types';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    tasks: async (root, args, context) => {
      if (!context.currentSession?.user) {
        return [];
      }
      const tasks = prisma.task.findMany({
        where: {
          creator_id: context.currentSession.user.id,
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
