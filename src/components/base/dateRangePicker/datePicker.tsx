import { ActionItem, Button } from '@/components/base/button';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { range } from 'lodash';
import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { MonthYearPicker } from './monthYearPicker';

dayjs.extend(isoWeek);

const computeDays = (
  ref: Date | Dayjs | number,
  opt: { min?: Date | Dayjs | number; max?: Date | Dayjs | number }
) => {
  let s = dayjs(ref || undefined)
    .startOf('month')
    .startOf('isoWeek');

  const end = dayjs(ref).endOf('month').endOf('isoWeek').add(1, 'd');

  const min = opt.min ? dayjs(opt.min || undefined).startOf('day') : null;

  const now = dayjs().startOf('day');
  return range(0, end.diff(s, 'day')).map((d) => {
    const r = s.add(d, 'day').startOf('day');
    return {
      today: r.isSame(now),
      disabled: min && r.isBefore(min),
      start: r.valueOf(),
      end: r.endOf('day').valueOf(),
      dateOfMonth: r.get('date'),
    };
  });
};

const DayItem = ({
  today,
  disabled,
  isHovered,
  isSelected,
  isStart,
  isEnd,
  className,
  ...props
}: {
  today?: boolean;
  disabled?: boolean | null;
  isHovered?: boolean | null;
  isSelected?: boolean | null;
  isStart?: boolean | null;
  isEnd?: boolean | null;
} & ComponentProps<'div'>) => {
  return (
    <div
      className={classNames(
        'h-[28px] flex items-center justify-center text-sm select-none border',
        {
          'border-highlight': isStart || isEnd,
          'border-transparent': !isStart && !isEnd,
          'text-highlight': today,
          'cursor-pointer': !disabled,
          'cursor-disabled text-gray-300': disabled,
          'bg-gray-300': isHovered,
          'bg-gray-200': !isHovered && isSelected,
          'rounded-l': isStart,
          'rounded-r': isEnd,
        },
        className
      )}
      {...props}
    />
  );
};

export const DatePicker = ({
  className,
  initialDate,
  selectedDateRange,

  hovered,
  onHover,
  onSelect,

  min,
  max,
}: {
  className?: string;
  initialDate?: Date | number | Dayjs;
  selectedDateRange?: {
    start: Date | number | Dayjs;
    end: Date | number | Dayjs;
  };

  hovered?: { start: number; end: number };
  onHover?: (date: Date | null) => void;
  onSelect?: (date: Date) => void;

  min?: Date | number | Dayjs;
  max?: Date | number | Dayjs;
}) => {
  const headers = useMemo(() => {
    const start = dayjs().startOf('isoWeek');
    return range(0, 7).map((d) => start.add(d, 'day').format('dd')[0]);
  }, []);

  const [refMonth, setRefMonth] = useState(() =>
    dayjs(initialDate ?? undefined)
  );
  const days = useMemo(
    () => computeDays(refMonth, { min, max }),
    [max, min, refMonth]
  );

  const selectedTimestamp = useMemo(
    () =>
      selectedDateRange
        ? {
            start: dayjs(selectedDateRange.start).startOf('day').valueOf(),
            end: dayjs(selectedDateRange.end).endOf('day').valueOf(),
          }
        : null,
    [selectedDateRange]
  );

  const prevMonthDisabled = useMemo(() => {
    if (!min) {
      return false;
    }
    return dayjs(min).format('MM/YYYY') === refMonth.format('MM/YYYY');
  }, [min, refMonth]);

  const daysContainerRef = useRef<HTMLDivElement>(null);

  // cleanup hovered
  useEffect(() => {
    if (!hovered) {
      return;
    }

    const listener = (e: MouseEvent) => {
      if (!daysContainerRef.current) {
        return;
      }

      const box = daysContainerRef.current.getBoundingClientRect();
      if (
        e.x < box.x ||
        e.x > box.x + box.width ||
        e.y < box.y ||
        e.y > box.y + box.height
      ) {
        onHover?.(null);
        // setHoveredDateRange(null);
      }
    };
    window.addEventListener('mousemove', listener);
    return () => {
      window.removeEventListener('mousemove', listener);
    };
  }, [hovered, onHover]);

  const [selectMonthYear, setSelectMonthYear] = useState(false);

  return (
    <div className={className}>
      {/* Month selector */}
      <div className="flex w-full justify-center items-center mb-2">
        <Button
          className=""
          onClick={() => {
            setRefMonth(refMonth.subtract(1, 'month'));
          }}
          disabled={prevMonthDisabled}
        >
          <FaCaretLeft />
        </Button>

        <ActionItem
          t="light"
          className="bg-transparent transition rounded w-[120px] text-center text-xs mx-2 select-none"
          onClick={() => {
            setSelectMonthYear(!selectMonthYear);
          }}
        >
          {dayjs(refMonth).format('MMMM YYYY')}
        </ActionItem>

        <Button
          className=""
          onClick={() => {
            setRefMonth(refMonth.add(1, 'month'));
          }}
        >
          <FaCaretRight />
        </Button>
      </div>

      {selectMonthYear && (
        <MonthYearPicker
          value={refMonth}
          className="max-h-[169px]"
          onChange={(date) => setRefMonth(dayjs(date))}
          onClose={(e) => {
            e.preventDefault();
            setSelectMonthYear(false);
          }}
        />
      )}
      {!selectMonthYear && (
        <>
          {/* Days header */}
          <div className="grid grid-cols-7">
            {headers.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center text-sm border-b border-gray-300 mb-2 select-none"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7" ref={daysContainerRef}>
            {days.map((r) => (
              <DayItem
                key={r.start}
                disabled={r.disabled}
                today={r.today}
                isSelected={
                  selectedTimestamp &&
                  selectedTimestamp.start <= r.start &&
                  r.end <= selectedTimestamp.end
                }
                isHovered={
                  hovered &&
                  hovered?.start <= r.start &&
                  hovered?.end >= r.start
                }
                isStart={
                  selectedTimestamp?.start === r.start ||
                  hovered?.start === r.start
                }
                isEnd={
                  selectedTimestamp?.end === r.end || hovered?.end === r.end
                }
                onClick={() => {
                  if (r.disabled) {
                    return;
                  }
                  onSelect?.(new Date(r.start));
                }}
                onMouseEnter={() => {
                  if (r.disabled) {
                    onHover?.(null);
                    return;
                  }
                  onHover?.(new Date(r.start));
                }}
              >
                {r.dateOfMonth}
              </DayItem>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
