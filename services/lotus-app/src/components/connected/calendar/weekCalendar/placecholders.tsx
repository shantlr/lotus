import dayjs, { Dayjs } from 'dayjs';
import { useHourSlots } from '../useHourSlots';
import { HOUR_SLOT_HEIGHT } from './constants';
import { OnCreateEvent } from '../types';
import clsx from 'clsx';
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
  onCreateEvent?: OnCreateEvent;
  slotProps?: ComponentProps<typeof SlotPlaceholder>;
}) => {
  const slots = useHourSlots({
    day,
    selectedEnd,
    selectedStart,
  });

  // const hour = new Date().getHours();

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
          className={clsx('hour-slot', {
            'border-r-2': idx === slots.length - 1,
            'border-b-dashed': idx < slots.length - 1,
            // 'border-b-highlight border-b-dashed':
            //   h.start.get('hour') === hour || h.end.get('hour') === hour,
            // 'border-r-highlight border-r-dashed':
            //   h.start.isSame(dayjs(), 'd') ||
            //   h.start.add(1, 'd').isSame(dayjs(), 'd'),
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
    <div className="w-full flex flex-grow pb-2">
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
