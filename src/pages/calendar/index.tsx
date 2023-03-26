import { Calendar } from '@/components/calendar';
import { CreateTaskPane } from '@/components/createTaskPane';
import { SideBar } from '@/components/sideBar';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export default function CalendarPage({ type }: { type?: string }) {
  const router = useRouter();

  const newTask = useMemo(() => {
    if (!('new_task' in router.query)) {
      return null;
    }
    if (typeof router.query.new_task === 'string') {
      const [start, end] = router.query.new_task
        .split(':')
        .map((d) => Number(d));
      if (isFinite(start)) {
        return {
          start: isFinite(start) ? new Date(start) : undefined,
          end: isFinite(end) ? new Date(end) : undefined,
        };
      }
    }
    return {};
  }, [router.query]);

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
        {newTask && (
          <CreateTaskPane
            initial={newTask}
            key={`${newTask.start}:${newTask.end}`}
            onClose={() => {
              router.replace(router.pathname);
            }}
          />
        )}
      </main>
    </>
  );
}
