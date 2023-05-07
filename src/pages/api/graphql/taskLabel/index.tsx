import { Resolvers } from '@/gql/__generated/resolversTypes';
import { GraphqlContext } from '../types';
import { UnauthenticatedError } from '../util';
import { prisma } from '@/lib/prisma';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    taskLabels(root, {}, { currentSession }) {
      if (!currentSession?.user) {
        throw new UnauthenticatedError();
      }

      return prisma.taskLabel.findMany({
        where: {
          creator_id: currentSession.user.id,
        },
      });
    },
  },
  TaskLabel: {
    color: async (root, {}, { currentSession }) => {
      const settings = await prisma.userTaskLabelSettings.findFirst({
        where: {
          user_id: currentSession.user?.id,
        },
      });
      return settings?.color || null;
    },
  },
};
