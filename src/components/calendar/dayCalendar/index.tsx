import classNames from 'classnames';
import dayjs from 'dayjs';
import customFormat from 'dayjs/plugin/customParseFormat';
import { range } from 'lodash';
import { useRouter } from 'next/router';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'urql';
import { QUERY_TASKS } from '../query';
import { AnchoredTaskItem, CalendarTask } from '../taskItem';
import { usePartitionTasks } from './useTasksPositions';
import { usePositionedTasks } from '../useTasksPosition';
import { useObserveWidth } from '@/components/base/hooks';

const HOUR_HEIGHT = 100;
const HEADER_HOUR_WIDTH = 45;
const TASK_MIN_HEIGHT = 35;

const DATE_FORMAT = 'DD/MM/YYYY';
dayjs.extend(customFormat);

export const DayCalendar = ({
  onCreateTask,
}: {
  onCreateTask?: (value: {
    elem?: HTMLElement;
    title?: string;
    start?: Date;
    end?: Date;
  }) => void;
}) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = dayjs();
    return {
      date: d,
      key: dayjs().format(DATE_FORMAT),
    };
  });

  const [{ data }, t] = useQuery({
    query: QUERY_TASKS,
    variables: {
      input: {
        start: selectedDate.date.startOf('day').toDate(),
        end: selectedDate.date.endOf('day').toDate(),
      },
    },
  });
  const datesContainerRef = useRef<HTMLDivElement | null>(null);

  const [dates, setDates] = useState(() => {
    return range(-15, 15).map((delta) => {
      const d = dayjs().add(delta, 'day');
      return {
        key: d.format(DATE_FORMAT),
        date: d,
        formatted: d.format('ddd DD/MM'),
      };
    });
  });

  // initial auto scroll date selector to today
  useLayoutEffect(() => {
    if (datesContainerRef.current) {
      const elem = datesContainerRef.current.querySelector<HTMLDivElement>(
        '.selected-date-item'
      );
      if (elem) {
        datesContainerRef.current.scroll({
          left:
            elem.offsetLeft -
            datesContainerRef.current.offsetLeft -
            elem.offsetWidth * 2,
        });
      }
    }
  }, []);

  const [hoursContainer, setHourContainer] = useState<HTMLDivElement | null>(
    null
  );
  // initial auto scroll to current hour range
  useLayoutEffect(() => {
    if (hoursContainer) {
      const elem = hoursContainer.querySelector<HTMLDivElement>(
        `.hour-block-${new Date().getHours()}`
      );
      if (elem) {
        hoursContainer.scroll({
          top:
            elem.offsetTop - hoursContainer.offsetTop - elem.offsetHeight * 1.2,
        });
      }
    }
  }, [hoursContainer]);

  const selectedDateRange = useMemo(
    () => ({
      start: selectedDate.date.startOf('day'),
      end: selectedDate.date.endOf('day'),
    }),
    [selectedDate?.date]
  );
  const [fulldayTask, tasks] = usePartitionTasks({
    tasks: data?.tasks,
    start: selectedDateRange.start,
    end: selectedDateRange.end,
  });
  const hourSlotWidth = useObserveWidth(hoursContainer, '.hour-slot');

  const positionedTasks = usePositionedTasks({
    currentRangeStart: selectedDateRange.start,
    currentRangeEnd: selectedDateRange.end,
    tasks,
    hourSlotHeight: HOUR_HEIGHT,
    hourSlotWidth: hourSlotWidth,
    taskMinHeight: TASK_MIN_HEIGHT,
    spacing: {
      collidingTasksXDivider: 4,
      hourSlotPaddingBottom: 2,
      hourSlotPaddingRight: 20,
    },
  });

  const router = useRouter();

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <div ref={datesContainerRef} className="py-4 w-full flex overflow-auto">
        {dates.map((u) => (
          <div
            key={u.key}
            onClick={() =>
              setSelectedDate({
                key: u.key,
                date: u.date,
              })
            }
            className={classNames(
              'date-item text-sm w-[90px] text-center rounded mx-4 flex-shrink-0 cursor-pointer transition hover:bg-gray-400',
              {
                'bg-gray-300 selected-date-item': selectedDate.key === u.key,
                'bg-gray-600 ': selectedDate.key !== u.key,
                'text-rose-300': u.key === dayjs().format('DD/MM/YYYY'),
              }
            )}
          >
            {u.formatted}
          </div>
        ))}
      </div>

      <div
        className={classNames('space-y-1', {
          'pb-2': fulldayTask.length > 0,
        })}
      >
        {fulldayTask.map((t) => (
          <AnchoredTaskItem key={t.id} task={t} />
        ))}
      </div>

      <div
        ref={setHourContainer}
        className="relative flex flex-col h-full w-full overflow-auto pr-4"
      >
        {/* Left hour header */}
        {range(0, 24).map((h) => (
          <div
            key={h}
            style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            className={`flex flex-shrink-0 w-full hover:bg-gray-800 hour-block-${h}`}
          >
            <div
              style={{ width: HEADER_HOUR_WIDTH }}
              className={classNames(
                'text-center text-sm border-r-2 border-r-gray-500',
                {
                  'text-rose-300': h === new Date().getHours(),
                }
              )}
            >{`${h}h`}</div>

            {/* Slot placeholder */}
            <div
              className={classNames(
                'hour-slot border-b-2 border-r-2 border-gray-700 w-full h-full cursor-pointer',
                {
                  'border-t-2 border-t-gray-700 rounded-tr': h === 0,
                  'rounded-br': h === 23,
                }
              )}
              onClick={(e) => {
                if (e.defaultPrevented) {
                  return;
                }

                if (onCreateTask) {
                  const start = selectedDate.date.hour(h).startOf('hour');
                  onCreateTask({
                    elem: e.target as HTMLDivElement,
                    start: start.toDate(),
                    end: start.add(1, 'h').toDate(),
                  });
                }
              }}
            ></div>
          </div>
        ))}

        {/* Tasks */}
        {positionedTasks.map(
          ({
            overflowAfter,
            overflowBefore,
            task,
            height,
            top,
            left,
            width,
          }) => {
            return (
              <CalendarTask
                key={task.id}
                id={task.id}
                className={classNames(
                  'task-item whitespace-pre-line overflow-hidden break-all absolute px-4 py-1',
                  {
                    'border-dashed border-t-white border-t-[1px]':
                      overflowBefore,
                    'border-dashed border-b-white border-b-[1px]':
                      overflowAfter,
                    'rounded-t': !overflowBefore,
                    'rounded-b': !overflowAfter,
                  }
                )}
                style={{
                  top,
                  height,
                  width,
                  left: left + HEADER_HOUR_WIDTH,
                }}
                task={task}
              />
            );
          }
        )}
      </div>
    </div>
  );
};
