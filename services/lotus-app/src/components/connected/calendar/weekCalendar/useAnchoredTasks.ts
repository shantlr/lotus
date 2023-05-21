import { useMemo } from 'react';
import { Task } from '../useTasksPosition';
import dayjs from 'dayjs';

export const useAnchoredTasks = ({
  tasks,
  daySlotWidth,
  currentRangeEnd,
  currentRangeStart,
}: {
  tasks: Task[];
  daySlotWidth?: number;
  currentRangeStart: Date;
  currentRangeEnd: Date;
}) => {
  return useMemo(() => {
    return tasks.map((t) => {
      const overflowBefore =
        new Date(t.start).valueOf() < currentRangeStart.valueOf();
      const overflowAfter =
        new Date(t.end).valueOf() > currentRangeEnd.valueOf();
      const start = overflowBefore ? dayjs(currentRangeStart) : dayjs(t.start);
      const end = overflowAfter ? dayjs(currentRangeEnd) : dayjs(t.end);

      return {
        task: t,
        left: dayjs(start).diff(currentRangeStart, 'day') * (daySlotWidth || 0),
        width: end.diff(start, 'day') * (daySlotWidth || 0),
      };
    });
  }, [currentRangeEnd, currentRangeStart, daySlotWidth, tasks]);
};
