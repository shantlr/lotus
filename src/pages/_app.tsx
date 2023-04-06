import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Authenticated } from '@/components/context/authenticated';
import { UrqlProvider } from '@/components/context/urql';
import { Themed } from '@/components/base/themed';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <UrqlProvider>
        <Authenticated>
          <Themed>
            <Component {...pageProps} />
          </Themed>
        </Authenticated>
      </UrqlProvider>
    </SessionProvider>
  );
}
