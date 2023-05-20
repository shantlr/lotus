import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Authenticated } from '@/components/context/authenticated';
import { UrqlProvider } from '@/components/context/urql';
import { useRouter } from 'next/router';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();

  if (router.pathname === '/') {
    return (
      <SessionProvider session={session}>
        <UrqlProvider>
          <Component {...pageProps} />
        </UrqlProvider>
      </SessionProvider>
    );
  }

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
