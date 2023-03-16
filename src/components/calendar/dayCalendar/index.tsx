import classNames from 'classnames';
import dayjs from 'dayjs';
import { range } from 'lodash';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const DayCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return dayjs().format('DD/MM/YYYY');
  });
  const dateSelectorRef = useRef<HTMLDivElement | null>(null);
  const [dates, setDates] = useState(() => {
    return range(-15, 15).map((delta) => {
      const d = dayjs().add(delta, 'day');
      return {
        key: d.format('DD/MM/YYYY'),
        month: d.month(),
        date: d.date(),
      };
    });
  });

  // initial auto scroll date selector to today
  useLayoutEffect(() => {
    if (dateSelectorRef.current) {
      const elem = dateSelectorRef.current.querySelector<HTMLDivElement>(
        '.selected-date-item'
      );
      if (elem) {
        dateSelectorRef.current.scroll({
          left:
            elem.offsetLeft -
            dateSelectorRef.current.offsetLeft -
            elem.offsetWidth * 2,
        });
      }
    }
  }, []);

  const hoursContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <div ref={dateSelectorRef} className="py-4 w-full flex overflow-auto">
        {dates.map((u) => (
          <div
            key={u.key}
            onClick={() => setSelectedDate(u.key)}
            className={classNames(
              'date-item text-sm w-[40px] text-center rounded mx-4 flex-shrink-0 cursor-pointer transition hover:bg-gray-400',
              {
                'bg-gray-300 selected-date-item': selectedDate === u.key,
                'bg-gray-600 ': selectedDate !== u.key,
              }
            )}
          >
            {u.date}/{u.month}
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
            className="flex h-[50px] flex-shrink-0 w-full hover:bg-gray-800"
          >
            <div className="text-center w-[35px] text-sm border-r-2 border-r-gray-500">{`${h}h`}</div>
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
