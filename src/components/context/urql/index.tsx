import { ReactElement } from 'react';
import {
  cacheExchange,
  createClient,
  dedupExchange,
  fetchExchange,
  Provider,
} from 'urql';

const client = createClient({
  url: '/api/graphql',
  exchanges: [dedupExchange, cacheExchange, fetchExchange],
  // fetchOptions: () => {
  //   const token = getToken();
  //   return {
  //     headers: { authorization: token ? `Bearer ${token}` : '' },
  //   };
  // },
});

export const UrqlProvider = ({ children }: { children: ReactElement }) => (
  <Provider value={client}>{children}</Provider>
);
