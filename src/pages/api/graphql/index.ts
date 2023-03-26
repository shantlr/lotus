import { Resolvers } from '@/gql/__generated/resolversTypes';
import { typeDefs } from '@/gql/__generated/typeDefs';
import { useGenericAuth } from '@envelop/generic-auth';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { createYoga } from 'graphql-yoga';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { resolvers as scalarResolvers } from 'graphql-scalars';

import { authOptions } from '../auth/[...nextauth]';
import { GraphqlContext } from './types';

import { resolvers as tasks } from './tasks';
import { pick } from 'lodash';

export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
};

const baseResolvers: Resolvers<GraphqlContext> = {
  Query: {
    greetings: () => 'Hello...',
  },
};

const schema = makeExecutableSchema({
  resolvers: [baseResolvers, pick(scalarResolvers, 'DateTime'), tasks],
  typeDefs: typeDefs,
});

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: '/api/graphql',
  plugins: [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGenericAuth({
      contextFieldName: 'currentSession',
      resolveUserFn: async (context: GraphqlContext) => {
        const user = await getServerSession(
          context.req,
          context.res,
          authOptions
        );
        return user;
      },
      validateUser: ({ user }) => {
        if (!user || !user.user) {
          throw new Error('UNAUTHENTICATED');
        }
      },
      mode: 'protect-all',
    }),
  ],
});
