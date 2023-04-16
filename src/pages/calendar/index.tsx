import { Calendar } from '@/components/calendar';
import { CalendarType } from '@/components/calendar/types';
import { CreateTaskPopper } from '@/components/createTaskPane';
import { MainLayout } from '@/layout/main';
import { omit } from 'lodash';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function CalendarPage({ type }: { type?: CalendarType }) {
  const router = useRouter();

  const [taskPopperElem, setPopperElem] = useState<HTMLElement>();

  const createTask = useMemo(() => {
    if (!('new_task' in router.query)) {
      return null;
    }

    if (typeof router.query.new_task === 'string') {
      const [start, end] = router.query.new_task
        .split(':')
        .map((d) => Number(d));
      if (isFinite(start) || isFinite(end)) {
        return {
          start: isFinite(start) ? start : undefined,
          end: isFinite(end) ? end : undefined,
        };
      }
      return {};
    }
  }, [router.query]);

  useEffect(() => {
    // auto clean popper elem
    if (!createTask && taskPopperElem) {
      // if we immediately clean timeout
      // there is a case where elem is cleaned before router updated
      // => timeout do the job
      const handle = setTimeout(() => {
        setPopperElem(undefined);
      }, 2000);
      return () => {
        clearTimeout(handle);
      };
    }
  }, [createTask, taskPopperElem]);

  const onOpenCreateTask = useCallback(
    (value: {
      elem?: HTMLElement;
      title?: string;
      start?: Date;
      end?: Date;
    }) => {
      setPopperElem(value.elem);
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          new_task: `${value.start?.valueOf() ?? ''}:${
            value.end?.valueOf() ?? ''
          }`,
        },
      });
    },
    [router]
  );

  return (
    <MainLayout>
      <Calendar
        type={type ?? 'week'}
        createTaskSelectedStart={createTask?.start}
        createTaskSelectedEnd={createTask?.end}
        onCreateTask={onOpenCreateTask}
      />
      {createTask && (
        <CreateTaskPopper
          start={createTask.start}
          end={createTask.end}
          parentElem={taskPopperElem}
          onStartChange={(d) => {
            router.replace({
              pathname: router.pathname,
              query: {
                ...router.query,
                new_task: `${d.valueOf()}:${createTask.end}`,
              },
            });
          }}
          onEndChange={(d) => {
            router.replace({
              pathname: router.pathname,
              query: {
                ...router.query,
                new_task: `${createTask.start}:${d.valueOf()}`,
              },
            });
          }}
          onClose={() => {
            router.replace({
              pathname: router.pathname,
              query: omit(router.query, ['new_task']),
            });
          }}
        />
      )}
    </MainLayout>
  );
}
