import classNames from 'classnames';
import dayjs from 'dayjs';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { QUERY_TASKS } from '../query';
import { AnchoredTaskItem, CalendarTask } from '../taskItem';
import { usePartitionTasks } from './useTasksPositions';
import { usePositionedTasks } from '../useTasksPosition';
import { useObserveWidth } from '@/components/base/hooks';
import { useHourSlots } from '../useHourSlots';
import { SlotPlaceholder } from '../slot';
import { OnCreateTask } from '../types';
import { useClickToCreateTask } from '../useClickToCreateTask';

const HOUR_HEIGHT = 100;
const HEADER_HOUR_WIDTH = 45;
const TASK_MIN_HEIGHT = 35;

export const DayCalendar = ({
  selectedStart,
  createTaskSelectedStart,
  createTaskSelectedEnd,
  onCreateTask,
}: {
  selectedStart: Date;
  createTaskSelectedStart?: Date | number;
  createTaskSelectedEnd?: Date | number;
  onSetSelectedStart?: Date;
  onCreateTask?: OnCreateTask;
}) => {
  const input = useMemo(
    () => ({
      start: dayjs(selectedStart).startOf('day').toDate(),
      end: dayjs(selectedStart).endOf('day').toDate(),
    }),
    [selectedStart]
  );

  const [{ data }] = useQuery({
    query: QUERY_TASKS,
    variables: {
      input,
    },
  });

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
      start: dayjs(selectedStart).startOf('day'),
      end: dayjs(selectedStart).endOf('day'),
    }),
    [selectedStart]
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

  const slots = useHourSlots({
    day: selectedDateRange.start,
    selectedStart: createTaskSelectedStart,
    selectedEnd: createTaskSelectedEnd,
  });

  const clickEvents = useClickToCreateTask({ onCreateTask });

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
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
        className="relative flex flex-col h-full w-full overflow-auto pr-4 pb-2"
      >
        {slots.map((s, h) => (
          <div
            key={s.key}
            style={{ height: HOUR_HEIGHT }}
            className={`flex flex-shrink-0 w-full hover:bg-gray-800 hour-block-${h}`}
          >
            {/* Left hour header */}
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
            <SlotPlaceholder
              selected={Boolean(s.selected)}
              className={classNames('hour-slot ', {
                'border-t-2 border-t-gray-700 rounded-tr': h === 0,
                'rounded-br': h === 23,
              })}
              data-slot-start={s.start.valueOf()}
              data-slot-end={s.end.valueOf()}
              {...clickEvents}
            />
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
