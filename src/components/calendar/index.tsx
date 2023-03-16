import classNames from 'classnames';
import { RadioGroup } from '../base/radio';
import { DayCalendar } from './dayCalendar';
import { MonthCalendar } from './monthCalendar';
import { WeekCalendar } from './weekCalendar';

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
}: {
  type?: string;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        'flex flex-col w-full h-full overflow-hidden',
        className
      )}
    >
      <div className="flex justify-center">
        <RadioGroup value={type ?? null} options={OPTIONS}></RadioGroup>
      </div>
      {type === 'day' && <DayCalendar />}
      {type === 'week' && <WeekCalendar />}
      {type === 'month' && <MonthCalendar />}
    </div>
  );
};
