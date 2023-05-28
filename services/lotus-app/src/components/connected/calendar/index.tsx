import clsx from 'clsx';
import { DayCalendar } from './dayCalendar';
import { MonthCalendar } from './monthCalendar';
import { WeekCalendar } from './weekCalendar';
import { CalendarType, OnCreateEvent } from './types';
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
  onCreateEvent,

  createEventSelectedStart,
  createEventSelectedEnd,
}: {
  className?: string;
  createEventSelectedStart?: Date | number;
  createEventSelectedEnd?: Date | number;
  onCreateEvent?: OnCreateEvent;
}) => {
  const [type, setType] = useState<CalendarType>('week');
  const [selectedStart, setSelectedStart] = useState<Date>(() => new Date());
  const [labelIds, setLabelIds] = useState<string[] | null>(null);

  return (
    <div
      className={clsx('flex flex-col w-full h-full overflow-hidden', className)}
    >
      <CalendarHeader
        selectedStart={selectedStart}
        setSelectedStart={setSelectedStart}
        type={type}
        setType={setType}
        onCreateEvent={onCreateEvent}
        labelIds={labelIds}
        onChangeLabelIds={setLabelIds}
      />

      {type === 'day' && (
        <DayCalendar
          selectedStart={selectedStart}
          createEventSelectedStart={createEventSelectedStart}
          createEventSelectedEnd={createEventSelectedEnd}
          onCreateEvent={onCreateEvent}
          labelIds={labelIds}
        />
      )}
      {type === 'week' && (
        <WeekCalendar
          selectedStart={selectedStart}
          createEventSelectedStart={createEventSelectedStart}
          createEventSelectedEnd={createEventSelectedEnd}
          onCreateEvent={onCreateEvent}
          labelIds={labelIds}
        />
      )}
      {type === 'month' && (
        <MonthCalendar
          createEventSelectedStart={createEventSelectedStart}
          createEventSelectedEnd={createEventSelectedEnd}
          onCreateEvent={onCreateEvent}
          labelIds={labelIds}
        />
      )}
    </div>
  );
};
