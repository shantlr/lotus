import { Calendar } from '@/components/calendar';
import { SideBar } from '@/components/sideBar';
import Head from 'next/head';

export default function CalendarPage({ type }: { type?: string }) {
  return (
    <>
      <Head>
        <title>Lotus</title>
        <meta name="description" content="Lotus" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full h-full flex">
        <SideBar />
        <Calendar className="p-2" type={type ?? 'day'} />
      </main>
    </>
  );
}
