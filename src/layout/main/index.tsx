import Head from 'next/head';
import { ReactNode } from 'react';
import { MainLayoutTopBar } from './topBar';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Head>
        <title>Lotus</title>
        <meta name="description" content="Lotus" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full h-full">
        <MainLayoutTopBar />
        {children}
      </main>
    </>
  );
};
