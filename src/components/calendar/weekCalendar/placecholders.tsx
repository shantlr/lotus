import dayjs, { Dayjs } from 'dayjs';
import { useHourSlots } from '../useHourSlots';
import { HOUR_SLOT_HEIGHT } from './constants';
import { OnCreateTask } from '../types';
import classNames from 'classnames';
import { SlotPlaceholder } from '../slot';
import { ComponentProps } from 'react';

const DayHourSlots = ({
  day,
  selectedEnd,
  selectedStart,
  slotProps,
}: {
  day: Date | Dayjs;
  selectedStart?: Date | number;
  selectedEnd?: Date | number;
  onCreateTask?: OnCreateTask;
  slotProps?: ComponentProps<typeof SlotPlaceholder>;
}) => {
  const slots = useHourSlots({
    day,
    selectedEnd,
    selectedStart,
  });
  return (
    <>
      {slots.map((h, idx) => (
        <SlotPlaceholder
          key={h.key}
          style={{ height: HOUR_SLOT_HEIGHT }}
          selected={h.selected}
          data-slot-start={h.start.valueOf()}
          data-slot-end={h.end.valueOf()}
          {...slotProps}
          className={classNames('hour-slot', {
            'border-r-2': idx === slots.length - 1,
          })}
        />
      ))}
    </>
  );
};

export const WeekCalendarPlaceholders = ({
  week,
  selectedEnd,
  selectedStart,

  slotProps,
}: {
  week: {
    days: {
      date: Dayjs;
      key: string;
    }[];
  };
  selectedStart?: Date | number;
  selectedEnd?: Date | number;

  slotProps?: ComponentProps<typeof SlotPlaceholder>;
}) => {
  return (
    <div className="w-full flex flex-grow">
      {week.days.map((d) => (
        <div className="flex-grow relative" key={d.key}>
          <DayHourSlots
            day={d.date}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            slotProps={slotProps}
          />
        </div>
      ))}
    </div>
  );
};
