import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { padStart, range } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import { useAutoScrollOnMount } from '../hooks/autoScroll';

const SelectHour = ({
  time,
  min: inputMin,
  onChange,
  onClose,
}: {
  time?: number | Date | Dayjs;
  min?: number | Date | Dayjs;
  onChange?: (date: Date) => void;
  onClose?: () => void;
}) => {
  const selected = useMemo(() => {
    const d = dayjs(time);
    return {
      hour: d.get('hour'),
      minutes: d.get('minute'),
    };
  }, [time]);

  const slots = useMemo(() => {
    const MIN_SLOT = 5;

    const min = inputMin ? dayjs(inputMin).valueOf() : null;

    return range(0, 24 * (60 / MIN_SLOT)).map((idx) => {
      const mins = idx * MIN_SLOT;
      const hour = Math.floor(mins / 60);
      const minutes = mins % 60;
      const timestamp = dayjs(time)
        .set('hour', hour)
        .set('minute', minutes)
        .valueOf();
      return {
        disabled: min && timestamp < min,
        hour,
        minutes,
        formatted: `${padStart(hour.toString(), 2, '0')}:${padStart(
          minutes.toString(),
          2,
          '0'
        )}`,
      };
    });
  }, [inputMin, time]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useAutoScrollOnMount(scrollContainerRef, '.selected');

  return (
    <div
      className="w-full flex max-h-[80px]"
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <div
        ref={scrollContainerRef}
        className="overflow-auto grow border-r-2 border-gray-200"
      >
        {slots.map((s) => (
          <div
            key={s.formatted}
            className={classNames('transition hover:bg-gray-100', {
              'text-gray-400 cursor-default': s.disabled,
              'selected bg-gray-200':
                s.hour === selected.hour && s.minutes === selected.minutes,
            })}
            onClick={(e) => {
              if (s.disabled) {
                return;
              }

              e.preventDefault();
              onChange?.(
                dayjs(time)
                  .set('hour', s.hour)
                  .set('minute', s.minutes)
                  .toDate()
              );
              onClose?.();
            }}
          >
            {s.formatted}
          </div>
        ))}
      </div>
    </div>
  );
};

export const HourPicker = ({
  time,
  min,
  onChange,
}: {
  time?: number | Date | Dayjs;
  min?: number | Date | Dayjs;
  onChange?: (date: Date) => void;
}) => {
  const [show, setShow] = useState(false);
  const formatted = useMemo(() => dayjs(time).format('HH:mm'), [time]);

  return (
    <div
      className="input-default transition w-full text-center text-sm select-none"
      onClick={(e) => {
        if (e.defaultPrevented) {
          return;
        }

        setShow(!show);
      }}
    >
      {!show && formatted}
      {show && (
        <SelectHour
          time={time}
          onChange={onChange}
          min={min}
          onClose={() => setShow(false)}
        />
      )}
    </div>
  );
};
