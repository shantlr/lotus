import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AdProvider from 'next-auth/providers/azure-ad';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { getRandomLabelColor } from '@/lib/label';
import { Provider } from 'next-auth/providers';

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
      })
    );
  } else {
    console.warn(
      `Azure Active Directory enabled but AAD_CLIENT_ID and/or AAD_CLIENT_SECRET not provided`
    );
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  events: {
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
