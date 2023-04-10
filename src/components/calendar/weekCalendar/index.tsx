import { useObserveWidth } from '@/components/base/hooks';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
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

const DATE_FORMAT = 'DD/MM/YYYY';

const mapWeekRange = (date: Dayjs) => {
  const weekStart = date.startOf('w');
  return {
    key: weekStart.add(1, 'day').format(DATE_FORMAT),
    start: weekStart,
    formatted: `${weekStart.add(1, 'day').format('D')} - ${weekStart
      .add(8, 'day')
      .format('D MMM')}`,
    days: range(1, 8).map((d) => {
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
  selectedEnd,
  onCreateTask,
}: {
  selectedStart?: Date | number;
  selectedEnd?: Date | number;
  onCreateTask?: OnCreateTask;
}) => {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const start = dayjs().subtract(1, 'day').startOf('week');
    return mapWeekRange(start);
  });

  const [weeks] = useState(() => {
    const currentWeek = dayjs().startOf('week');
    return range(-6, 6).map((i) => mapWeekRange(currentWeek.add(i, 'week')));
  });

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

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="w-full flex overflow-auto py-4">
        {weeks.map((w) => (
          <div
            onClick={() => {
              setSelectedWeek(w);
            }}
            className={classNames(
              'shrink-0 text-sm w-[100px] rounded text-center transition hover:bg-gray-400 cursor-pointer mx-4',
              {
                'bg-gray-300': w.key === selectedWeek.key,
                'bg-gray-600 ': w.key !== selectedWeek.key,
              }
            )}
            key={w.key}
          >
            {w.formatted}
          </div>
        ))}
      </div>
      <div className="flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <div className="flex w-full pr-4 border-b-2 border-b-gray-500">
          <div
            style={{ width: HOUR_SLOT_HEADER_WIDTH }}
            className={`shrink-0 border-r-2 border-gray-700`}
          ></div>
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
        <div
          className={classNames('space-y-1', {
            'py-1': anchoredTasks.length > 0,
          })}
        >
          {anchoredTasks.map((t) => (
            <AnchoredTaskItem
              className="relative"
              style={{
                width: t.width,
                left: t.left + HOUR_SLOT_HEADER_WIDTH,
              }}
              key={t.task.id}
              task={t.task}
            />
          ))}
        </div>

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
                  className={`text-center w-full hover:bg-gray-800 hour-block-${h} border-r-2 border-gray-700 text-sm`}
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
            onCreateTask={onCreateTask}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
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
