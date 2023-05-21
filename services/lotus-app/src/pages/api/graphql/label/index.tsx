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
    label: async (root, { id }, { currentSession: { user } }) => {
      if (!user) {
        return null;
      }

      return prisma.label.findFirst({
        where: {
          id,
          userSettings: {
            some: {
              user_id: user.id,
            },
          },
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
    updatLabel: async (
      root,
      { input: { id, ...update } },
      { currentSession: { user } }
    ) => {
      if (!user) {
        throw new UnauthenticatedError();
      }

      const label = await prisma.label.findFirst({ where: { id } });
      if (!label) {
        throw new Error('INVALID_LABEL');
      }
      if (label.creator_id !== user.id) {
        throw new UnauthorizedError();
      }

      if (update.name && update.name !== label.name) {
        await prisma.label.update({
          where: { id },
          data: { name: update.name },
        });
      }
      if (update.color) {
        if (!(update.color in LABEL_COLORS)) {
          throw new Error('INVALID_COLOR');
        }
        await prisma.userLabelSettings.update({
          where: {
            user_id_task_label_id: {
              user_id: user.id,
              task_label_id: id,
            },
          },
          data: {
            color: LABEL_COLORS[update.color as keyof typeof LABEL_COLORS].bg,
            secondary_color:
              LABEL_COLORS[update.color as keyof typeof LABEL_COLORS].outline,
          },
        });
      }

      return await prisma.label.findFirst({ where: { id } });
    },
    deleteLabel: async (
      root,
      { input: { id } },
      { currentSession: { user } }
    ) => {
      if (!user) {
        throw new UnauthenticatedError();
      }

      const label = await prisma.label.findFirst({
        where: {
          id,
        },
      });
      if (!label) {
        throw new Error('INVALID_LABEL');
      }
      if (label?.creator_id !== user.id) {
        throw new UnauthorizedError();
      }

      await prisma.label.delete({
        where: {
          id,
        },
      });
      return true;
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
