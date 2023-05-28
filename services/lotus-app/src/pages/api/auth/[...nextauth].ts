import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AdProvider from 'next-auth/providers/azure-ad';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { Provider } from 'next-auth/providers/index';
import { getRandomLabelColor } from 'lotus-common/label';
import { createSyncExternalCalendarJob } from '@/lib/queue';

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const providers: Provider[] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

if (process.env.AAD_ENABLED) {
  if (process.env.AAD_CLIENT_ID && process.env.AAD_CLIENT_SECRET) {
    providers.push(
      AdProvider({
        clientId: process.env.AAD_CLIENT_ID,
        // NOTE: TENANT_ID should only be provided if user should be defined in tenant
        tenantId: process.env.AAD_TENANT_ID,
        clientSecret: process.env.AAD_CLIENT_SECRET,
        authorization: {
          params: {
            scope: 'openid,email,profile,Calendars.Read',
          },
        },
      })
    );
  } else {
    console.warn(
      `Azure Active Directory enabled but AAD_CLIENT_ID and/or AAD_CLIENT_SECRET not provided`
    );
  }
}

const adapter = PrismaAdapter(prisma);
export const authOptions: AuthOptions = {
  adapter,
  providers,
  events: {
    async signIn({ user, account, profile }) {
      // Update access token
      if (account) {
        try {
          const userFromDatabase = await adapter.getUser(user.id);
          if (userFromDatabase) {
            await prisma.account.update({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              data: {
                access_token: account.access_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
                session_state: account.session_state,
                scope: account.scope,
              },
            });
          }
          void createSyncExternalCalendarJob(account);
        } catch (err) {
          if (err instanceof Error) {
            console.error(err.message);
          }
        }
      }
    },
    createUser: async ({ user }) => {
      const color = getRandomLabelColor();
      // Init calendar
      await prisma.label.create({
        data: {
          name: 'Calendar',
          assignable: true,
          creator_id: user.id,
          userSettings: {
            create: {
              color: color.bg,
              secondary_color: color.outline,
              user_id: user.id,
            },
          },
        },
      });
    },
  },
  callbacks: {
    session: ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
