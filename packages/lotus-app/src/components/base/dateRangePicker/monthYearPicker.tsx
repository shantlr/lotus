import clsx from 'clsx';
import dayjs, { Dayjs } from 'dayjs';
import { last, range } from 'lodash';
import { ActionItem, Button } from '../button';
import { MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useAutoScrollOnMount } from '../hooks/autoScroll';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export const MonthYearPicker = ({
  value,
  className,
  onChange,
  onClose,
}: {
  value?: Date | number | Dayjs;
  className?: string;
  onChange?: (date: Date) => void;
  onClose?: (e: MouseEvent) => void;
}) => {
  const current = useMemo(() => {
    const d = dayjs();
    return {
      month: d.get('month'),
      year: d.get('year'),
    };
  }, []);
  const selectedMonth = useMemo(() => dayjs(value).get('month'), [value]);
  const selectedYear = useMemo(() => dayjs(value).get('year'), [value]);
  const [years, setYears] = useState(() => {
    return [
      ...range(30, 0).map((d) => selectedYear - d),
      selectedYear,
      ...range(1, 30).map((d) => selectedYear + d),
    ];
  });

  const yearRef = useRef<HTMLDivElement>(null);
  useAutoScrollOnMount(yearRef, '.active');
  const monthRef = useRef<HTMLDivElement>(null);
  useAutoScrollOnMount(monthRef, '.active');

  useInfiniteScroll(yearRef, {
    onLoadNext: useCallback(() => {
      const y = last(years) as number;
      setYears([...years, ...range(1, 30).map((d) => d + y)]);
    }, [years]),
    onLoadPrev: useCallback(() => {
      const y = years[0] as number;
      setYears([...range(30, 1).map((d) => y - d), ...years]);
    }, [years]),
  });

  return (
    <div className={clsx('flex flex-col overflow-hidden', className)}>
      <div className={clsx('flex grow overflow-hidden')}>
        <div ref={monthRef} className="overflow-auto w-full grow">
          {range(0, 12).map((idx) => (
            <ActionItem
              t="white-ghost-light"
              active={idx === selectedMonth}
              className={clsx('rounded px-2 text-sm select-none', {
                'text-highlight': idx === current.month,
              })}
              key={idx}
              onClick={() => {
                onChange?.(dayjs(value).set('month', idx).toDate());
              }}
            >
              {dayjs().set('month', idx).format('MMMM')}
            </ActionItem>
          ))}
        </div>
        <div ref={yearRef} className="w-full grow overflow-auto">
          {years.map((y) => (
            <ActionItem
              t="white-ghost-light"
              active={y === selectedYear}
              className={clsx('rounded text-sm px-2 select-none', {
                'text-highlight': y === current.year,
              })}
              key={y}
              onClick={() => {
                onChange?.(dayjs(value).set('year', y).toDate());
              }}
            >
              {y}
            </ActionItem>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-end border-t pt-2">
        <Button className="text-xs" onClick={onClose}>
          OK
        </Button>
      </div>
    </div>
  );
};
