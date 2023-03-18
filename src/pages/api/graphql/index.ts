import { Resolvers } from '@/gql/__generated/resolversTypes';
import { typeDefs } from '@/gql/__generated/typeDefs';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { createYoga } from 'graphql-yoga';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
};

const resolvers: Resolvers = {
  Query: {
    greetings: () => 'Hello...',
  },
};

const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: typeDefs,
});

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: '/api/graphql',
});
