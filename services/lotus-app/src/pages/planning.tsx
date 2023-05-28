import { ActionItem } from '@/components/base/button';
import { graphql } from '@/gql/__generated/client';
import {
  Order,
  GetPlanningEventsQuery,
} from '@/gql/__generated/client/graphql';
import { MainLayout } from '@/layout/main';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useQuery } from 'urql';

const PLANNING_EVENTS_QUERY = graphql(`
  query GetPlanningEvents($input: GetCalendarEventsInput) {
    calendarEvents(input: $input) {
      id
      title
      start
      end
    }
  }
`);

type Event = GetPlanningEventsQuery['calendarEvents'][number];

const DayItem = ({ date, events }: { date: Dayjs; events: Event[] }) => {
  return (
    <div className="flex">
      <div className="w-[60px]">{date.format('DD')}</div>
      <div className="grow space-y-2">
        {events.map((t) => (
          <ActionItem className="rounded px-4" key={t.id}>
            {t.title}
          </ActionItem>
        ))}
      </div>
    </div>
  );
};

export default function PlanningPage() {
  const [{ start, end }, setRange] = useState<{ start: number; end: number }>(
    () => {
      return {
        start: dayjs().add(-15, 'day').valueOf(),
        end: dayjs().add(1, 'M').valueOf(),
      };
    }
  );

  const [{ data }] = useQuery({
    query: PLANNING_EVENTS_QUERY,
    variables: {
      input: {
        order: Order.Asc,
      },
    },
  });

  const eventsByDay = useMemo(() => {
    const res: Record<string, Event[]> = {};
    data?.calendarEvents?.forEach((e) => {
      let s = dayjs(e.start).startOf('day');
      const end = dayjs(e.end).valueOf();
      while (s.isBefore(end)) {
        const k = s.format('DD/MM/YYYY');
        if (!(k in res)) {
          res[k] = [];
        }
        res[k].push(e);

        s = s.add(1, 'day');
      }
    });

    return res;
  }, [data?.calendarEvents]);

  const days = useMemo(() => {
    let s = dayjs(start).startOf('day');
    const e = dayjs(end).endOf('day');

    const res: (
      | { key: string; type: 'month'; date: Dayjs }
      | { key: number; type: 'day'; start: Dayjs; events: Event[] }
    )[] = [];

    let last: Dayjs | null = null;

    while (s.isBefore(e)) {
      const k = s.format('DD/MM/YYYY');
      const events = eventsByDay[k];
      if (events?.length) {
        if (!last || !last.isSame(s, 'month')) {
          res.push({
            key: s.format('MM/YYYY'),
            date: s,
            type: 'month',
          });
        }
        res.push({
          key: s.valueOf(),
          type: 'day',
          start: s,
          events,
        });
        last = s;
      }
      s = s.add(1, 'day');
    }
    return res;
  }, [end, start, eventsByDay]);

  return (
    <MainLayout>
      <div className="space-y-4 p-4">
        {days.map((d) => (
          <div key={d.key}>
            {d.type === 'month' && <div>{d.date.format('MMMM YYYY')}</div>}
            {d.type === 'day' && <DayItem date={d.start} events={d.events} />}
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
