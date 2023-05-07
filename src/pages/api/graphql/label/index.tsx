import { Resolvers } from '@/gql/__generated/resolversTypes';
import { GraphqlContext } from '../types';
import { UnauthenticatedError } from '../util';
import { prisma } from '@/lib/prisma';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    labels(root, {}, { currentSession }) {
      if (!currentSession?.user) {
        throw new UnauthenticatedError();
      }

      return prisma.label.findMany({
        where: {
          creator_id: currentSession.user.id,
        },
      });
    },
  },
  Label: {
    color: async (root, {}, { currentSession }) => {
      const settings = await prisma.userLabelSettings.findFirst({
        where: {
          user_id: currentSession.user?.id,
        },
      });
      return settings?.color || null;
    },
    secondaryColor: async (root, {}, { currentSession }) => {
      const settings = await prisma.userLabelSettings.findFirst({
        where: {
          user_id: currentSession.user?.id,
        },
      });
      return settings?.secondary_color || null;
    },
  },
};
