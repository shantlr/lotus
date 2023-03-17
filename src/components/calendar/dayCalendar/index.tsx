import classNames from 'classnames';
import dayjs from 'dayjs';
import { range } from 'lodash';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const HOUR_HEIGHT = 120;

export const DayCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return dayjs().format('DD/MM/YYYY');
  });
  const datesContainerRef = useRef<HTMLDivElement | null>(null);
  const [dates, setDates] = useState(() => {
    return range(-15, 15).map((delta) => {
      const d = dayjs().add(delta, 'day');
      return {
        key: d.format('DD/MM/YYYY'),
        month: d.month(),
        date: d.date(),
        formatted: d.format('DD MMM'),
      };
    });
  });

  // initial auto scroll date selector to today
  useLayoutEffect(() => {
    if (datesContainerRef.current) {
      const elem = datesContainerRef.current.querySelector<HTMLDivElement>(
        '.selected-date-item'
      );
      if (elem) {
        datesContainerRef.current.scroll({
          left:
            elem.offsetLeft -
            datesContainerRef.current.offsetLeft -
            elem.offsetWidth * 2,
        });
      }
    }
  }, []);

  const hoursContainerRef = useRef<HTMLDivElement | null>(null);
  // initial auto scroll to current hour range
  useLayoutEffect(() => {
    if (hoursContainerRef.current) {
      const elem = hoursContainerRef.current.querySelector<HTMLDivElement>(
        `.hour-block-${new Date().getHours()}`
      );
      if (elem) {
        hoursContainerRef.current.scroll({
          top:
            elem.offsetTop -
            hoursContainerRef.current.offsetTop -
            elem.offsetHeight * 2,
        });
      }
    }
  }, []);

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <div ref={datesContainerRef} className="py-4 w-full flex overflow-auto">
        {dates.map((u) => (
          <div
            key={u.key}
            onClick={() => setSelectedDate(u.key)}
            className={classNames(
              'date-item text-sm w-[70px] text-center rounded mx-4 flex-shrink-0 cursor-pointer transition hover:bg-gray-400',
              {
                'bg-gray-300 selected-date-item': selectedDate === u.key,
                'bg-gray-600 ': selectedDate !== u.key,
                'text-rose-300': u.key === dayjs().format('DD/MM/YYYY'),
              }
            )}
          >
            {u.formatted}
          </div>
        ))}
      </div>
      <div
        ref={hoursContainerRef}
        className="flex flex-col overflow-auto w-full h-full pr-4"
      >
        {range(0, 24).map((h) => (
          <div
            key={h}
            style={{ height: HOUR_HEIGHT }}
            className={`flex flex-shrink-0 w-full hover:bg-gray-800 hour-block-${h}`}
          >
            <div
              className={classNames(
                'text-center w-[35px] text-sm border-r-2 border-r-gray-500',
                {
                  'text-rose-300': h === new Date().getHours(),
                }
              )}
            >{`${h}h`}</div>
            <div
              className={classNames(
                'border-b-2 border-r-2 border-gray-700 w-full h-full',
                {
                  'border-t-2 border-t-gray-700 rounded-tr': h === 0,
                  'rounded-br': h === 23,
                }
              )}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};
