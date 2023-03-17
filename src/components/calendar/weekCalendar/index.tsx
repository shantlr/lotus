import dayjs from 'dayjs';
import { range } from 'lodash';
import { useState } from 'react';

export const WeekCalendar = () => {
  const [weekDays, setWeekDays] = useState(() => {
    const start = dayjs().startOf('week');
    return range(0, 7).map((d) => {
      const date = start.add(d, 'day');
      return {
        key: date.format('DD/MM/YYYY'),
        formatted: date.format('DD MMM'),
      };
    });
  });

  return (
    <div className="flex w-full h-full overflow-hidden">
      <div className="flex flex-col w-full h-full overflow-hidden pr-4">
        <div className="flex w-full">
          <div className="w-[30px]"></div>
          {weekDays.map((d) => (
            <div className="flex-grow border-l-2 border-gray-700" key={d.key}>
              <div className="text-center">{d.formatted}</div>
            </div>
          ))}
        </div>

        <div className="h-full w-full overflow-auto">
          <div className="flex w-full">
            <div className="w-[30px] h-full">
              {range(0, 24).map((h) => (
                <div
                  className={`h-[60px] text-center w-full hover:bg-gray-800 hour-block-${h}`}
                  key={h}
                >
                  {h}h
                </div>
              ))}
            </div>
            {weekDays.map((d) => (
              <div
                className="flex-grow border-l-2 h-auto border-gray-700"
                key={d.key}
              >
                <div className="">A</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col overflow-auto w-full h-full pr-4">
        {range(0, 24).map((h) => (
          <div
            key={h}
            className={`flex h-[50px] flex-shrink-0 w-full hover:bg-gray-800 hour-block-${h}`}
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
      </div> */}
    </div>
  );
};
