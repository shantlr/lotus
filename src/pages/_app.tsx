import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Authenticated } from '@/components/context/authenticated';
import { UrqlProvider } from '@/components/context/urql';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <UrqlProvider>
        <Authenticated>
          <Component {...pageProps} />
        </Authenticated>
      </UrqlProvider>
    </SessionProvider>
  );
}
