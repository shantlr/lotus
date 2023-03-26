import { Calendar } from '@/components/calendar';
import { CreateTaskPane } from '@/components/createTaskPane';
import { SideBar } from '@/components/sideBar';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function CalendarPage({ type }: { type?: string }) {
  const router = useRouter();

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
        {'new_task' in router.query && (
          <CreateTaskPane
            onClose={() => {
              router.replace(router.pathname);
            }}
          />
        )}
      </main>
    </>
  );
}
