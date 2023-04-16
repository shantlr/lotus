import { ActionItem, Button } from '@/components/base/button';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { range } from 'lodash';
import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaCalendarAlt,
  FaCalendarDay,
  FaCalendarWeek,
  FaCaretLeft,
  FaCaretRight,
} from 'react-icons/fa';
import { CalendarType } from '../types';
import { IconButton } from '@/components/base/iconButton';

dayjs.extend(isoWeek);

const computeDays = (ref: Date | Dayjs | number) => {
  let s = dayjs(ref || undefined)
    .startOf('month')
    .startOf('isoWeek');

  const end = dayjs(ref).endOf('month').endOf('isoWeek').add(1, 'd');

  return range(0, end.diff(s, 'day')).map((d) => {
    const r = s.add(d, 'day');
    return {
      start: r.valueOf(),
      end: r.endOf('day').valueOf(),
      dateOfMonth: r.get('date'),
    };
  });
};

const DayItem = ({
  isHovered,
  isSelected,
  isStart,
  isEnd,
  className,
  ...props
}: {
  isHovered?: boolean | null;
  isSelected?: boolean | null;
  isStart?: boolean | null;
  isEnd?: boolean | null;
} & ComponentProps<'div'>) => {
  return (
    <div
      className={classNames(
        'h-[28px] flex items-center justify-center text-sm cursor-pointer select-none',
        {
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

export const SelectDateRange = ({
  type,
  onSetType,
  initialDate,
  selectedDateRange,
  onSelectDateRange,
}: {
  type?: CalendarType;
  onSetType?: (type: CalendarType) => void;
  initialDate?: Date | number | Dayjs;
  selectedDateRange?: {
    start: Date | number | Dayjs;
    end: Date | number | Dayjs;
  };
  onSelectDateRange?: (dateRange: { start: Date; end: Date }) => void;
}) => {
  const headers = useMemo(() => {
    const start = dayjs().startOf('isoWeek');
    return range(0, 7).map((d) => start.add(d, 'day').format('dd')[0]);
  }, []);

  const [refMonth, setRefMonth] = useState(() =>
    dayjs(initialDate ?? undefined)
  );
  const days = useMemo(() => computeDays(refMonth), [refMonth]);

  const selectedTimestamp = useMemo(
    () =>
      selectedDateRange
        ? {
            start: selectedDateRange.start.valueOf(),
            end: selectedDateRange.end.valueOf(),
          }
        : null,
    [selectedDateRange]
  );

  const daysContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredDateRange, setHoveredDateRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // cleanup hovered
  useEffect(() => {
    if (!hoveredDateRange) {
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
        setHoveredDateRange(null);
      }
    };
    window.addEventListener('mousemove', listener);
    return () => {
      window.removeEventListener('mousemove', listener);
    };
  }, [hoveredDateRange]);

  return (
    <div className="">
      {/* Header buttons */}
      {onSetType && (
        <div className="flex mb-2">
          <IconButton
            active={type === 'day'}
            icon={FaCalendarDay}
            onClick={() => onSetType('day')}
          />
          <IconButton
            active={type === 'week'}
            icon={FaCalendarWeek}
            onClick={() => onSetType('week')}
          />
          <IconButton
            active={type === 'month'}
            icon={FaCalendarAlt}
            onClick={() => onSetType('month')}
          />
        </div>
      )}
      {/* Month selector */}
      <div className="flex w-full justify-center items-center mb-2">
        <Button
          className=""
          onClick={() => {
            setRefMonth(refMonth.subtract(1, 'month'));
          }}
        >
          <FaCaretLeft />
        </Button>

        <ActionItem
          t="light"
          className="bg-transparent transition rounded w-[120px] text-center text-xs mx-2"
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
            isSelected={
              selectedTimestamp &&
              selectedTimestamp.start <= r.start &&
              r.end <= selectedTimestamp.end
            }
            isHovered={
              hoveredDateRange &&
              hoveredDateRange?.start <= r.start &&
              hoveredDateRange?.end >= r.start
            }
            isStart={
              selectedTimestamp?.start === r.start ||
              hoveredDateRange?.start === r.start
            }
            isEnd={
              selectedTimestamp?.end === r.end ||
              hoveredDateRange?.end === r.end
            }
            onClick={() => {
              if (!onSelectDateRange) {
                return;
              }

              if (type === 'day') {
                onSelectDateRange({
                  start: new Date(r.start),
                  end: new Date(r.end),
                });
              } else if (type === 'week') {
                onSelectDateRange({
                  start: dayjs(r.start).startOf('isoWeek').toDate(),
                  end: dayjs(r.start).endOf('isoWeek').toDate(),
                });
              }
            }}
            onMouseEnter={() => {
              if (type === 'day') {
                setHoveredDateRange({
                  start: r.start,
                  end: r.end,
                });
              } else if (type === 'week') {
                setHoveredDateRange({
                  start: dayjs(r.start).startOf('isoWeek').valueOf(),
                  end: dayjs(r.start).endOf('isoWeek').valueOf(),
                });
              }
            }}
          >
            {r.dateOfMonth}
          </DayItem>
        ))}
      </div>
    </div>
  );
};
