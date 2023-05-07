import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { LABEL_COLORS, getRandomLabelColor } from '@/lib/label';
import { random } from 'lodash';

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

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
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
