import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { first, last, range } from 'lodash';
import { useState } from 'react';
import { useQuery } from 'urql';
import { QUERY_TASKS } from '../query';

const DATE_FORMAT = 'DD/MM/YYYY';
const HOUR_HEIGHT = 100;
const HEADER_HOUR_WIDTH = 35;

const mapWeekRange = (date: Dayjs) => {
  const weekStart = date.startOf('w');
  return {
    key: weekStart.format(DATE_FORMAT),
    start: weekStart,
    formatted: `${weekStart.add(1, 'day').format('D')} - ${weekStart
      .add(8, 'day')
      .format('D MMM')}`,
  };
};

export const WeekCalendar = () => {
  const [weekDays, setWeekDays] = useState(() => {
    const start = dayjs().startOf('week');
    return range(1, 8).map((d) => {
      const date = start.add(d, 'day');
      return {
        key: date.format(DATE_FORMAT),
        date,
        formatted: date.format('dd, DD MMM'),
      };
    });
  });

  const [weeks] = useState(() => {
    const currentWeek = dayjs().startOf('week');
    return range(-6, 6).map((i) => mapWeekRange(currentWeek.add(i, 'week')));
  });

  const [{ data }, t] = useQuery({
    query: QUERY_TASKS,
    variables: {
      input: {
        start: first(weekDays)?.date.startOf('day').toDate(),
        end: last(weekDays)?.date.endOf('day').toDate(),
      },
    },
  });

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="w-full flex overflow-auto py-4">
        {weeks.map((w) => (
          <div
            className={classNames(
              'shrink-0 text-sm w-[100px] rounded text-center transition hover:bg-gray-400 cursor-pointer mx-4',
              {
                'bg-gray-600 ': true,
              }
            )}
            key={w.key}
          >
            {w.formatted}
          </div>
        ))}
      </div>
      <div className="flex flex-col w-full h-full overflow-hidden">
        {/* Header */}
        <div className="flex w-full pr-4">
          <div className={`w-[${HEADER_HOUR_WIDTH}px] shrink-0`}></div>
          {weekDays.map((d, idx) => (
            <div
              className={classNames(
                'w-full flex-grow border-l-2 border-b-2 border-b-gray-500 border-gray-700',
                {
                  'border-r-2': idx === weekDays.length - 1,
                }
              )}
              key={d.key}
            >
              <div
                className={classNames('text-sm text-center', {
                  'text-rose-300': d.key === dayjs().format(DATE_FORMAT),
                })}
              >
                {d.formatted}
              </div>
            </div>
          ))}
        </div>

        <div className="h-full w-full flex overflow-auto pr-4">
          {/* Hour header */}
          <div className={`flex shrink-0 w-[${HEADER_HOUR_WIDTH}px]`}>
            <div className="w-full h-full">
              {range(0, 24).map((h) => (
                <div
                  className={`h-[${HOUR_HEIGHT}px] text-center w-full hover:bg-gray-800 hour-block-${h}`}
                  key={h}
                >
                  {h}h
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-grow">
            {weekDays.map((d, idx) => (
              <div className="flex-grow relative" key={d.key}>
                {range(0, 24).map((h) => (
                  <div
                    key={h}
                    className={classNames(
                      `h-[${HOUR_HEIGHT}px] border-l-2 border-gray-700 border-b-2 border-b-gray-500`,
                      {
                        'border-r-2': idx === weekDays.length - 1,
                      }
                    )}
                  >
                    azezae
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
