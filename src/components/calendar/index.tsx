import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaPlus } from 'react-icons/fa';

import { Button } from '../base/button';
import { RadioGroup } from '../base/radio';
import { DayCalendar } from './dayCalendar';
import { MonthCalendar } from './monthCalendar';
import { WeekCalendar } from './weekCalendar';
import { OnCreateTask } from './types';

const OPTIONS = [
  {
    value: 'day',
    label: 'Day',
    to: '/calendar/day',
  },
  {
    value: 'week',
    label: 'Week',
    to: '/calendar/week',
  },
  {
    value: 'month',
    label: 'Month',
    to: '/calendar/month',
  },
];

export const Calendar = ({
  type,
  className,
  onCreateTask,

  selectedStart,
  selectedEnd,
}: {
  type?: string;
  className?: string;
  selectedStart?: Date | number;
  selectedEnd?: Date | number;
  onCreateTask?: OnCreateTask;
}) => {
  const router = useRouter();
  return (
    <div
      className={classNames(
        'flex flex-col w-full h-full overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div>
        <Link
          href={{
            pathname: router.pathname,
            query: {
              ...router.query,
              new_task: '',
            },
          }}
        >
          <Button highlight className="float-right" round>
            <FaPlus />
          </Button>
        </Link>
        <div className="flex justify-center">
          <RadioGroup value={type ?? null} options={OPTIONS}></RadioGroup>
        </div>
      </div>

      {type === 'day' && (
        <DayCalendar
          selectedStart={selectedStart}
          selectedEnd={selectedEnd}
          onCreateTask={onCreateTask}
        />
      )}
      {type === 'week' && (
        <WeekCalendar
          selectedStart={selectedStart}
          selectedEnd={selectedEnd}
          onCreateTask={onCreateTask}
        />
      )}
      {type === 'month' && (
        <MonthCalendar
          selectedStart={selectedStart}
          selectedEnd={selectedEnd}
          onCreateTask={onCreateTask}
        />
      )}
    </div>
  );
};
