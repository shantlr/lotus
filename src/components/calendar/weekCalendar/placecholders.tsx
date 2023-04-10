import dayjs, { Dayjs } from 'dayjs';
import { useHourSlots } from '../useHourSlots';
import { HOUR_SLOT_HEIGHT } from './constants';
import { OnCreateTask } from '../types';
import classNames from 'classnames';
import { SlotPlaceholder } from '../slot';

const DayHourSlots = ({
  day,
  selectedEnd,
  selectedStart,
  onCreateTask,
}: {
  day: Date | Dayjs;
  selectedStart?: Date | number;
  selectedEnd?: Date | number;
  onCreateTask?: OnCreateTask;
}) => {
  console.log({ selectedEnd, selectedStart });
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
          onClick={(e) => {
            if (e.defaultPrevented) {
              return;
            }

            if (onCreateTask) {
              const start = h.date;
              onCreateTask({
                elem: e.target as HTMLDivElement,
                start: start.toDate(),
                end: start.add(1, 'h').toDate(),
              });
            }
          }}
          className={classNames(
            'hour-slot',
            // `hour-slot border-l-2 border-gray-700 border-b-2 border-b-gray-500 cursor-pointer hover:bg-gray-800 transition`,
            {
              'border-r-2': idx === slots.length - 1,
            }
          )}
        />
      ))}
    </>
  );
};

export const WeekCalendarPlaceholders = ({
  week,
  selectedEnd,
  selectedStart,
  onCreateTask,
}: {
  week: {
    days: {
      date: Dayjs;
      key: string;
    }[];
  };
  selectedStart?: Date | number;
  selectedEnd?: Date | number;
  onCreateTask?: OnCreateTask;
}) => {
  return (
    <div className="w-full flex flex-grow">
      {week.days.map((d) => (
        <div className="flex-grow relative" key={d.key}>
          <DayHourSlots
            day={d.date}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            onCreateTask={onCreateTask}
          />
        </div>
      ))}
    </div>
  );
};
