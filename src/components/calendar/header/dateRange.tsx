import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useCallback, useState } from 'react';
import {
  FaCalendarAlt,
  FaCalendarDay,
  FaCalendarWeek,
  FaRedo,
} from 'react-icons/fa';
import { CalendarType } from '../types';
import { IconButton } from '@/components/base/iconButton';
import { DatePicker } from '@/components/base/dateRangePicker/datePicker';

dayjs.extend(isoWeek);

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
  const [hovered, setHovered] = useState<{ start: number; end: number }>();

  const onHover = useCallback(
    (date: Date | null) => {
      if (!date) {
        setHovered(undefined);
        return;
      }

      if (type === 'day') {
        setHovered({
          start: dayjs(date).startOf('day').valueOf(),
          end: dayjs(date).endOf('day').valueOf(),
        });
      } else if (type === 'week') {
        setHovered({
          start: dayjs(date).startOf('isoWeek').valueOf(),
          end: dayjs(date).endOf('isoWeek').valueOf(),
        });
      }
    },
    [type]
  );

  const onSelect = useCallback(
    (date: Date) => {
      if (!onSelectDateRange) {
        return;
      }
      if (type === 'day') {
        onSelectDateRange({
          start: new Date(dayjs(date).startOf('date').valueOf()),
          end: new Date(dayjs(date).endOf('date').valueOf()),
        });
      } else if (type === 'week') {
        onSelectDateRange({
          start: dayjs(date).startOf('isoWeek').toDate(),
          end: dayjs(date).endOf('isoWeek').toDate(),
        });
      }
    },
    [onSelectDateRange, type]
  );

  return (
    <div className="">
      {/* Header buttons */}
      {onSetType && (
        <div className="flex mb-2 space-x-1">
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
          <div className="w-full" />
          <IconButton
            icon={FaRedo}
            onClick={() => {
              if (!onSelectDateRange) {
                return;
              }

              if (type === 'day') {
                onSelectDateRange?.({
                  start: dayjs().startOf('d').toDate(),
                  end: dayjs().endOf('d').toDate(),
                });
              } else if (type === 'week') {
                onSelectDateRange?.({
                  start: dayjs().startOf('isoWeek').toDate(),
                  end: dayjs().endOf('isoWeek').toDate(),
                });
              } else if (type === 'month') {
                onSelectDateRange?.({
                  start: dayjs().startOf('month').toDate(),
                  end: dayjs().endOf('month').toDate(),
                });
              }
            }}
          />
        </div>
      )}
      <DatePicker
        initialDate={initialDate}
        selectedDateRange={selectedDateRange}
        hovered={hovered}
        onHover={onHover}
        onSelect={onSelect}
      />
    </div>
  );
};
