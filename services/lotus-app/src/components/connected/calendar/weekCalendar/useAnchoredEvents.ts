import { useMemo } from 'react';
import { Event } from '../useEventsPosition';
import dayjs from 'dayjs';

export const useAnchoredEvents = ({
  events,
  daySlotWidth,
  currentRangeEnd,
  currentRangeStart,
}: {
  events: Event[];
  daySlotWidth?: number;
  currentRangeStart: Date;
  currentRangeEnd: Date;
}) => {
  return useMemo(() => {
    return events.map((t) => {
      const overflowBefore =
        new Date(t.start).valueOf() < currentRangeStart.valueOf();
      const overflowAfter =
        new Date(t.end).valueOf() > currentRangeEnd.valueOf();
      const start = overflowBefore ? dayjs(currentRangeStart) : dayjs(t.start);
      const end = overflowAfter ? dayjs(currentRangeEnd) : dayjs(t.end);

      return {
        event: t,
        left: dayjs(start).diff(currentRangeStart, 'day') * (daySlotWidth || 0),
        width: end.diff(start, 'day') * (daySlotWidth || 0),
      };
    });
  }, [currentRangeEnd, currentRangeStart, daySlotWidth, events]);
};
