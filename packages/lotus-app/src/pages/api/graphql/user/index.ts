import { AccountProvider, Resolvers } from '@/gql/__generated/resolversTypes';
import { prisma } from '@/lib/prisma';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { GraphqlContext } from '../types';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    me: (root, args, { currentSession: { user } }) => {
      return {
        user,
      };
    },
  },

  UserView: {
    accounts: async ({ user }) => {
      if (!user) {
        return null;
      }

      const accounts = await prisma.account.findMany({
        where: {
          userId: user.id,
        },
      });

      return accounts;
    },
  },
  Account: {
    email: (acc) => {
      if (acc.provider === 'google' && acc.id_token) {
        const data = jwt.decode(acc.id_token) as JwtPayload & {
          at_hash?: string;
          email?: string;
          email_verified?: string;
          name?: string;
          given_name?: string;
          family_name?: string;
          picture?: string;
          locale?: string;
        };
        return data.email ?? null;
      }
      if (acc.provider === 'azure-ad' && acc.id_token) {
        const data = jwt.decode(acc.id_token) as JwtPayload & {
          ver?: string;
          name?: string;
          preferred_username?: string;
          oid?: string;
          email?: string;
          tid?: string;
          aio?: string;
        };
        return data.email ?? null;
      }
      return null;
    },
    provider: (acc) => {
      switch (acc.provider) {
        case 'google': {
          return AccountProvider.Google;
        }
        case 'azure-ad': {
          return AccountProvider.Azuread;
        }
      }
      return null;
    },
  },
};
