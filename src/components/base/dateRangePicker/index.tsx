import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Popper, PopperBody } from '../popper';
import { DatePicker } from './datePicker';
import { HourPicker } from './hourPicker';
import { Button } from '../button';

const Picker = ({
  start: initialStart,
  end: initialEnd,
  onChange,
  onClose,
}: {
  start?: Date | number;
  end?: Date | number;
  onChange?: (range: { start: Date; end: Date }) => void;
  onClose?: () => void;
}) => {
  const [start, setStart] = useState(() => new Date(initialStart as number));
  const [end, setEnd] = useState(() => new Date(initialEnd as number));
  const [hoveredStart, setHoveredStart] = useState<{
    start: number;
    end: number;
  }>();
  const [hoveredEnd, setHoveredEnd] = useState<{
    start: number;
    end: number;
  }>();
  const selectedRange = useMemo(
    () => ({
      start,
      end,
    }),
    [end, start]
  );

  return (
    <div>
      <div className="flex">
        <div>
          {/* Left picker allow to move select duration */}
          <DatePicker
            hovered={hoveredStart}
            initialDate={start}
            selectedDateRange={selectedRange}
            onHover={(date) => {
              if (!date) {
                setHoveredStart(undefined);
                return;
              }
              const diff = dayjs(date)
                .startOf('day')
                .diff(dayjs(start).startOf('day'), 'day');
              setHoveredStart({
                start: dayjs(start).add(diff, 'day').startOf('day').valueOf(),
                end: dayjs(end).add(diff, 'day').endOf('day').valueOf(),
              });
            }}
            onSelect={(date) => {
              const diff = dayjs(date)
                .startOf('day')
                .diff(dayjs(start).startOf('day'), 'day');
              setStart?.(dayjs(start).add(diff, 'day').toDate());
              setEnd?.(dayjs(end).add(diff, 'day').toDate());
            }}
          />
          <HourPicker
            time={start}
            onChange={(date) => {
              setStart(date);
              if (dayjs(date).isAfter(dayjs(end))) {
                setEnd(dayjs(date).add(15, 'minute').toDate());
              }
            }}
          />
        </div>
        <div className="ml-4">
          {/* Right picker allow to change duration */}
          <DatePicker
            initialDate={end}
            selectedDateRange={selectedRange}
            min={start}
            hovered={hoveredEnd}
            onHover={(date) => {
              if (!date) {
                setHoveredEnd(undefined);
                return;
              }
              setHoveredEnd({
                start: dayjs(start).startOf('day').valueOf(),
                end: dayjs(date).endOf('day').valueOf(),
              });
            }}
            onSelect={(date) => {
              const e = dayjs(end);
              const s = dayjs(start);
              let newEnd = dayjs(date)
                .set('hour', e.get('hour'))
                .set('minute', e.get('minute'));
              if (newEnd.valueOf() <= s.valueOf()) {
                // autofix end before start
                newEnd = newEnd
                  .set('hour', s.get('hour'))
                  .set('minute', s.get('minute') + 15);
              }
              setEnd?.(newEnd.toDate());
            }}
          />
          <HourPicker min={start} time={end} onChange={setEnd} />
        </div>
      </div>
      <div className="pt-2 flex justify-end">
        <Button
          className="min-w-[65px] text-sm mr-4"
          onClick={() => {
            onClose?.();
          }}
        >
          Cancel
        </Button>
        <Button
          t="highlight"
          className="min-w-[65px] text-sm"
          onClick={(range) => {
            onChange?.({ start, end });
            onClose?.();
          }}
        >
          Ok
        </Button>
      </div>
    </div>
  );
};

export const DateRangePicker = ({
  start,
  end,
  onChange,
}: {
  start?: Date | number;
  end?: Date | number;
  onChange?: (range: { start: Date; end: Date }) => void;
}) => {
  const [show, setShow] = useState(false);

  return (
    <Popper
      show={show}
      onClose={setShow}
      options={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ],
      }}
      popper={
        <PopperBody className="p-4 bg-white">
          <Picker
            start={start}
            end={end}
            onClose={() => {
              setShow(false);
            }}
            onChange={onChange}
          />
        </PopperBody>
      }
    >
      <div
        className="w-full"
        onClick={() => {
          setShow(!show);
        }}
      >
        <div className="text-sm input-default px-4 select-none">
          {dayjs(start).format('DD/MM/YYYY HH:mm')}
        </div>
        <div className="mt-2 text-sm input-default px-4 select-none">
          {dayjs(end).format('DD/MM/YYYY HH:mm')}
        </div>
      </div>
    </Popper>
  );
};
