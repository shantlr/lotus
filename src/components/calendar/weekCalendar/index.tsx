import { useObserveWidth } from '@/components/base/hooks';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { first, last, range } from 'lodash';
import { useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { QUERY_TASKS } from '../query';
import { AnchoredTaskItem, CalendarTask } from '../taskItem';
import { useAnchoredTasks } from './useAnchoredTasks';
import {
  SlotSpacing,
  usePartitionTasks,
  usePositionedTasks,
} from '../useTasksPosition';
import { WeekCalendarPlaceholders } from './placecholders';
import { HOUR_SLOT_HEADER_WIDTH, HOUR_SLOT_HEIGHT } from './constants';
import { OnCreateTask } from '../types';
import { useClickToCreateTask } from '../useClickToCreateTask';

dayjs.extend(isoWeek);

const DATE_FORMAT = 'DD/MM/YYYY';

const mapWeekRange = (date: Dayjs) => {
  const weekStart = date.startOf('isoWeek');
  return {
    key: weekStart.format(DATE_FORMAT),
    start: weekStart,
    formatted: `${weekStart.format('D')} - ${weekStart
      .endOf('isoWeek')
      .format('D MMM')}`,
    days: range(0, 7).map((d) => {
      const date = weekStart.add(d, 'day');
      return {
        key: date.format(DATE_FORMAT),
        date,
        formatted: date.format('dd, DD MMM'),
      };
    }),
  };
};

const SPACING: SlotSpacing = {
  hourSlotPaddingRight: 10,
  hourSlotPaddingBottom: 2,
  collidingTasksXDivider: 2,
};

export const WeekCalendar = ({
  selectedStart,
  createTaskSelectedStart,
  createTaskSelectedEnd,
  onCreateTask,
}: {
  selectedStart: Date;
  createTaskSelectedStart?: Date | number;
  createTaskSelectedEnd?: Date | number;
  onCreateTask?: OnCreateTask;
}) => {
  const selectedWeek = useMemo(() => {
    return mapWeekRange(dayjs(selectedStart));
  }, [selectedStart]);

  const currenteDateRange = useMemo(
    () =>
      ({
        start: first(selectedWeek.days)?.date.startOf('day').toDate(),
        end: last(selectedWeek.days)?.date.endOf('day').toDate(),
      } as { start: Date; end: Date }),
    [selectedWeek]
  );

  const [{ data }] = useQuery({
    query: QUERY_TASKS,
    variables: {
      input: {
        start: currenteDateRange.start,
        end: currenteDateRange.end,
      },
    },
  });

  const [tasksContainer, setTasksContainer] = useState<HTMLDivElement | null>(
    null
  );

  const [tasks, multiDayTasks] = usePartitionTasks({
    tasks: data?.tasks,
    currentRangeEnd: currenteDateRange.end,
    currentRangeStart: currenteDateRange.start,
  });
  const hourSlotWidth = useObserveWidth(tasksContainer, '.hour-slot');

  const positionedTasks = usePositionedTasks({
    tasks,
    hourSlotHeight: HOUR_SLOT_HEIGHT,
    hourSlotWidth,
    currentRangeStart: currenteDateRange.start,
    currentRangeEnd: currenteDateRange.end,

    taskMinHeight: 20,
    spacing: SPACING,
  });

  const anchoredTasks = useAnchoredTasks({
    tasks: multiDayTasks,
    daySlotWidth: hourSlotWidth,
    currentRangeStart: currenteDateRange.start,
    currentRangeEnd: currenteDateRange.end,
  });

  const slotClickHandlers = useClickToCreateTask({
    onCreateTask,
  });

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <div className="flex w-full pr-4 border-b-2 border-b-gray-500">
          <div
            style={{ width: HOUR_SLOT_HEADER_WIDTH }}
            className={`shrink-0 border-r-2 border-gray-700`}
          />
          {selectedWeek.days.map((d, idx) => (
            <div
              className={classNames(
                'w-full flex-grow border-r-2 border-gray-700',
                {
                  'border-r-2': idx === selectedWeek.days.length - 1,
                }
              )}
              key={d.key}
            >
              <div
                className={classNames('text-sm text-center', {
                  'text-rose-300': d.key === dayjs().format(DATE_FORMAT),
                })}
              >
                {d.formatted}
              </div>
            </div>
          ))}
        </div>

        {anchoredTasks.length > 0 && (
          <div
            className={classNames('relative space-y-1', {
              'py-1': anchoredTasks.length > 0,
            })}
          >
            {anchoredTasks.map((t) => (
              <AnchoredTaskItem
                className="relative z-10"
                style={{
                  width: t.width,
                  left: t.left + HOUR_SLOT_HEADER_WIDTH,
                }}
                key={t.task.id}
                task={t.task}
              />
            ))}
            <div className="absolute flex h-full w-full top-0 z-0 pr-4">
              <div
                className="border-r-2 border-gray-700"
                style={{ width: HOUR_SLOT_HEADER_WIDTH }}
              />
              {selectedWeek.days.map((d) => (
                <div
                  className="flex-grow border-r-2 border-b-2 border-gray-700"
                  key={d.key}
                />
              ))}
            </div>
          </div>
        )}

        <div
          ref={setTasksContainer}
          key={selectedWeek.key}
          className="relative h-full w-full flex overflow-auto pr-4"
        >
          {/* Hour header */}
          <div
            style={{ width: HOUR_SLOT_HEADER_WIDTH }}
            className={`flex shrink-0`}
          >
            <div className="w-full h-full">
              {range(0, 24).map((h) => (
                <div
                  style={{ height: HOUR_SLOT_HEIGHT }}
                  className={classNames(
                    `text-center w-full hover:bg-gray-800 hour-block-${h} border-r-2 border-gray-700 text-sm`,
                    {
                      'text-highlight': new Date().getHours() === h,
                    }
                  )}
                  key={h}
                >
                  {h}h
                </div>
              ))}
            </div>
          </div>

          {/* Placeholders */}
          <WeekCalendarPlaceholders
            week={selectedWeek}
            selectedStart={createTaskSelectedStart}
            selectedEnd={createTaskSelectedEnd}
            slotProps={slotClickHandlers}
          />

          {/* Tasks */}
          {positionedTasks.map((t) => (
            <CalendarTask
              style={{
                top: t.top,
                height: t.height,
                left: t.left + HOUR_SLOT_HEADER_WIDTH + 2,
                width: t.width,
              }}
              className="text-xs absolute px-[6px] py-[6px] whitespace-pre-line overflow-hidden break-all"
              key={t.task.id}
              task={t.task}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
