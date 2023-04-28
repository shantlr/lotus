import { ActionItem } from '@/components/base/button';
import { graphql } from '@/gql/__generated/client';
import { Order, PlanningTasksQuery } from '@/gql/__generated/client/graphql';
import { MainLayout } from '@/layout/main';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useQuery } from 'urql';

const PLANNING_TASKS_QUERY = graphql(`
  query PlanningTasks($input: GetTasksInput) {
    tasks(input: $input) {
      id
      title
      start
      end
    }
  }
`);

type Task = PlanningTasksQuery['tasks'][number];

const DayItem = ({ date, tasks }: { date: Dayjs; tasks: Task[] }) => {
  return (
    <div className="flex">
      <div className="w-[60px]">{date.format('DD')}</div>
      <div className="grow space-y-2">
        {tasks.map((t) => (
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
    query: PLANNING_TASKS_QUERY,
    variables: {
      input: {
        order: Order.Asc,
      },
    },
  });

  const tasksByDay = useMemo(() => {
    const res: Record<string, Task[]> = {};
    data?.tasks?.forEach((t) => {
      let s = dayjs(t.start).startOf('day');
      const end = dayjs(t.end).valueOf();
      while (s.isBefore(end)) {
        const k = s.format('DD/MM/YYYY');
        if (!(k in res)) {
          res[k] = [];
        }
        res[k].push(t);

        s = s.add(1, 'day');
      }
    });

    return res;
  }, [data?.tasks]);

  const days = useMemo(() => {
    let s = dayjs(start).startOf('day');
    const e = dayjs(end).endOf('day');

    const res: (
      | { key: string; type: 'month'; date: Dayjs }
      | { key: number; type: 'day'; start: Dayjs; tasks: Task[] }
    )[] = [];

    let last: Dayjs | null = null;

    while (s.isBefore(e)) {
      const k = s.format('DD/MM/YYYY');
      const tasks = tasksByDay[k];
      if (tasks?.length) {
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
          tasks,
        });
        last = s;
      }
      s = s.add(1, 'day');
    }
    return res;
  }, [end, start, tasksByDay]);

  return (
    <MainLayout>
      <div className="space-y-4 p-4">
        {days.map((d) => (
          <div key={d.key}>
            {d.type === 'month' && <div>{d.date.format('MMMM YYYY')}</div>}
            {d.type === 'day' && <DayItem date={d.start} tasks={d.tasks} />}
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
