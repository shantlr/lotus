import dayjs, { Dayjs } from 'dayjs';
import { range } from 'lodash';
import { useMemo } from 'react';

export const useHourSlots = ({
  day,
  selectedStart,
  selectedEnd,
}: {
  day: Date | Dayjs | number;
  selectedStart?: Date | number;
  selectedEnd?: Date | number;
}) => {
  return useMemo(() => {
    const start = dayjs(day).startOf('day');
    return range(0, 24).map((s) => {
      const d = start.set('hour', s);
      return {
        key: d.valueOf(),
        start: d,
        end: d.add(1, 'h'),

        selected: Boolean(
          selectedStart &&
            selectedEnd &&
            d.valueOf() >= selectedStart.valueOf() &&
            d.add(1, 'hour').valueOf() <= selectedEnd.valueOf()
        ),
      };
    });
  }, [day, selectedEnd, selectedStart]);
};
