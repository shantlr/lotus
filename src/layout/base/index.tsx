import Head from 'next/head';
import { ReactNode } from 'react';

export const LayoutBase = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <Head>
        <title>Lotus</title>
        <meta name="description" content="Lotus" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col overflow-hidden w-full h-full">
        {children}
      </main>
    </>
  );
};
