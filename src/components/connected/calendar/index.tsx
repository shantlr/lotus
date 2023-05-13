import classNames from 'classnames';
import { DayCalendar } from './dayCalendar';
import { MonthCalendar } from './monthCalendar';
import { WeekCalendar } from './weekCalendar';
import { CalendarType, OnCreateTask } from './types';
import { CalendarHeader } from './header';
import { useState } from 'react';

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
  className,
  onCreateTask,

  createTaskSelectedStart,
  createTaskSelectedEnd,
}: {
  className?: string;
  createTaskSelectedStart?: Date | number;
  createTaskSelectedEnd?: Date | number;
  onCreateTask?: OnCreateTask;
}) => {
  const [type, setType] = useState<CalendarType>('week');
  const [selectedStart, setSelectedStart] = useState<Date>(() => new Date());
  const [labelIds, setLabelIds] = useState<string[] | null>(null);

  return (
    <div
      className={classNames(
        'flex flex-col w-full h-full overflow-hidden',
        className
      )}
    >
      <CalendarHeader
        selectedStart={selectedStart}
        setSelectedStart={setSelectedStart}
        type={type}
        setType={setType}
        onCreateTask={onCreateTask}
        labelIds={labelIds}
        onChangeLabelIds={setLabelIds}
      />

      {type === 'day' && (
        <DayCalendar
          selectedStart={selectedStart}
          createTaskSelectedStart={createTaskSelectedStart}
          createTaskSelectedEnd={createTaskSelectedEnd}
          onCreateTask={onCreateTask}
          labelIds={labelIds}
        />
      )}
      {type === 'week' && (
        <WeekCalendar
          selectedStart={selectedStart}
          createTaskSelectedStart={createTaskSelectedStart}
          createTaskSelectedEnd={createTaskSelectedEnd}
          onCreateTask={onCreateTask}
          labelIds={labelIds}
        />
      )}
      {type === 'month' && (
        <MonthCalendar
          createTaskSelectedStart={createTaskSelectedStart}
          createTaskSelectedEnd={createTaskSelectedEnd}
          onCreateTask={onCreateTask}
          labelIds={labelIds}
        />
      )}
    </div>
  );
};
