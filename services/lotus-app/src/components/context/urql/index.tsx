import { ReactElement } from 'react';
import { createClient, fetchExchange, Provider } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import { GraphCacheConfig } from '@/gql/__generated/client/graphcache';
import { omit, pickBy } from 'lodash';

const client = createClient({
  url: '/api/graphql',
  exchanges: [
    cacheExchange<GraphCacheConfig>({
      // @ts-ignore
      storage: undefined,

      resolvers: {
        Query: {
          calendarEvent(parent, args, cache, info) {
            return { __typename: 'CalendarEvent', id: args.id };
          },
        },
      },
      optimistic: {
        updateCalendarEvent(args, cache, info) {
          const up = pickBy(omit(args.input, ['id', 'labelIds']));
          if (args.input.labelIds) {
            up.labels = args.input.labelIds.map((id) => ({
              id,
            }));
          }
          return {
            __typename: 'CalendarEvent',
            id: args.input.id,
            ...up,
          };
        },
      },
      updates: {
        Mutation: {
          createCalendarEvent: (result, args, cache, info) => {
            cache.inspectFields('Query').forEach((q) => {
              if (q.fieldName === 'calendarEvents') {
                cache.invalidate('Query', q.fieldName, q.arguments);
              }
            });
          },
          createLabel: (result, args, cache, info) => {
            cache.inspectFields('Query').forEach((q) => {
              if (q.fieldName === 'labels') {
                cache.invalidate('Query', q.fieldName, q.arguments);
              }
            });
          },
          deleteCalendarEvent: (result, args, cache, info) => {
            cache.invalidate({
              __typename: 'CalendarEvent',
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
