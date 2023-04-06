import { ReactElement } from 'react';
import { createClient, fetchExchange, Provider } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';

const client = createClient({
  url: '/api/graphql',
  exchanges: [
    cacheExchange({
      resolvers: {
        Query: {
          task(parent, args, cache, info) {
            return { __typename: 'Task', id: args.id };
          },
        },
      },
      updates: {
        Mutation: {
          createTask: (result, args, cache, info) => {
            cache.inspectFields('Query').forEach((q) => {
              if (q.fieldName === 'tasks') {
                cache.invalidate('Query', q.fieldName, q.arguments);
              }
            });
          },
          deleteTask: (result, args, cache, info) => {
            cache.invalidate({
              __typename: 'Task',
              // @ts-ignore
              id: args.input.id,
            });
          },
        },
      },
    }),
    fetchExchange,
  ],
});

export const UrqlProvider = ({ children }: { children: ReactElement }) => (
  <Provider value={client}>{children}</Provider>
);
