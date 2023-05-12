import { Resolvers } from '@/gql/__generated/resolversTypes';
import { GraphqlContext } from '../types';
import { UnauthenticatedError, UnauthorizedError } from '../util';
import { prisma } from '@/lib/prisma';
import { LABEL_COLORS } from '@/lib/label';
import { map } from 'lodash';

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
    labelColors: () => {
      return map(LABEL_COLORS, (c, id) => ({
        id,
        main: c.bg,
        outline: c.outline,
      }));
    },
  },
  Mutation: {
    createLabel: async (
      root,
      { input: { name, color } },
      { currentSession: { user } }
    ) => {
      if (!user) {
        throw new UnauthorizedError();
      }

      if (!(color in LABEL_COLORS)) {
        throw new Error('INVALID_COLOR');
      }

      const label = await prisma.label.create({
        data: {
          creator_id: user.id,
          name,
          assignable: true,
          userSettings: {
            create: {
              color: LABEL_COLORS[color as keyof typeof LABEL_COLORS].bg,
              secondary_color:
                LABEL_COLORS[color as keyof typeof LABEL_COLORS].outline,
              user_id: user.id,
            },
          },
        },
      });
      return label;
    },
  },
  Label: {
    color: async (label, {}, { currentSession }) => {
      const settings = await prisma.userLabelSettings.findFirst({
        where: {
          user_id: currentSession.user?.id,
          task_label_id: label.id,
        },
      });
      return settings?.color || null;
    },
    secondaryColor: async (label, {}, { currentSession }) => {
      const settings = await prisma.userLabelSettings.findFirst({
        where: {
          user_id: currentSession.user?.id,
          task_label_id: label.id,
        },
      });
      return settings?.secondary_color || null;
    },
  },
};
