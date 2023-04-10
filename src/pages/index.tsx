import Head from 'next/head';
import { SideBar } from '@/components/sideBar';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Lotus</title>
        <meta name="description" content="Lotus" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full h-full">
        <>
          <SideBar />
        </>
      </main>
    </>
  );
}
