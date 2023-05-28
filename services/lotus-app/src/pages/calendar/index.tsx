import { Calendar } from '@/components/connected/calendar';
import { CalendarType } from '@/components/connected/calendar/types';
import { CreateCalendarEventPopper } from '@/components/connected/createEvent';
import { MainLayout } from '@/layout/main';
import { omit } from 'lodash';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function CalendarPage({ type }: { type?: CalendarType }) {
  const router = useRouter();

  const [eventPopperElem, setPopperElem] = useState<HTMLElement>();

  const createEvent = useMemo(() => {
    if (!('new_event' in router.query)) {
      return null;
    }

    if (typeof router.query.new_event === 'string') {
      const [start, end] = router.query.new_event
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
    if (!createEvent && eventPopperElem) {
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
  }, [createEvent, eventPopperElem]);

  const onOpenCreateEvent = useCallback(
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
          new_event: `${value.start?.valueOf() ?? ''}:${
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
        createEventSelectedStart={createEvent?.start}
        createEventSelectedEnd={createEvent?.end}
        onCreateEvent={onOpenCreateEvent}
      />
      {createEvent && (
        <CreateCalendarEventPopper
          start={createEvent.start}
          end={createEvent.end}
          parentElem={eventPopperElem}
          onStartChange={(d) => {
            router.replace({
              pathname: router.pathname,
              query: {
                ...router.query,
                new_event: `${d.valueOf()}:${createEvent.end}`,
              },
            });
          }}
          onEndChange={(d) => {
            router.replace({
              pathname: router.pathname,
              query: {
                ...router.query,
                new_event: `${createEvent.start}:${d.valueOf()}`,
              },
            });
          }}
          onClose={() => {
            router.replace({
              pathname: router.pathname,
              query: omit(router.query, ['new_event']),
            });
          }}
        />
      )}
    </MainLayout>
  );
}
