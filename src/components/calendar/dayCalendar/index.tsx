import { graphql } from '@/gql/__generated/client';
import classNames from 'classnames';
import dayjs from 'dayjs';
import customFormat from 'dayjs/plugin/customParseFormat';
import { range } from 'lodash';
import { useRouter } from 'next/router';
import { useLayoutEffect, useRef, useState } from 'react';
import { useQuery } from 'urql';
import { QUERY_TASKS } from '../query';
import { useHeightSizedTasks, usePositionedTasks } from './useTasksPositions';

const HOUR_HEIGHT = 120;
const HEADER_HOUR_WIDTH = 35;
const TASK_MIN_HEIGHT = 35;

const DATE_FORMAT = 'DD/MM/YYYY';
dayjs.extend(customFormat);

export const DayCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = dayjs();
    return {
      date: d,
      key: dayjs().format(DATE_FORMAT),
    };
  });

  const [{ data }, t] = useQuery({
    query: QUERY_TASKS,
    variables: {
      input: {
        start: selectedDate.date.startOf('day').toDate(),
        end: selectedDate.date.endOf('day').toDate(),
      },
    },
  });
  const datesContainerRef = useRef<HTMLDivElement | null>(null);

  const [dates, setDates] = useState(() => {
    return range(-15, 15).map((delta) => {
      const d = dayjs().add(delta, 'day');
      return {
        key: d.format(DATE_FORMAT),
        date: d,
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
            elem.offsetHeight * 1.2,
        });
      }
    }
  }, []);

  const heightSizedTasks = useHeightSizedTasks({
    refDay: selectedDate.date,
    data,
    size: {
      hourSlotHeight: HOUR_HEIGHT,
      taskMinHeight: TASK_MIN_HEIGHT,
    },
  });
  usePositionedTasks(hoursContainerRef, heightSizedTasks, {
    offsetLeft: HEADER_HOUR_WIDTH,
    spaceBetweenTask: 5,
  });

  const router = useRouter();

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <div ref={datesContainerRef} className="py-4 w-full flex overflow-auto">
        {dates.map((u) => (
          <div
            key={u.key}
            onClick={() =>
              setSelectedDate({
                key: u.key,
                date: u.date,
              })
            }
            className={classNames(
              'date-item text-sm w-[70px] text-center rounded mx-4 flex-shrink-0 cursor-pointer transition hover:bg-gray-400',
              {
                'bg-gray-300 selected-date-item': selectedDate.key === u.key,
                'bg-gray-600 ': selectedDate.key !== u.key,
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
        className="relative flex flex-col h-full w-full overflow-auto pr-4"
      >
        {/* Left hour header */}
        {range(0, 24).map((h) => (
          <div
            key={h}
            style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            // style={{ height: HOUR_HEIGHT }}
            className={`hour-slot flex flex-shrink-0 w-full hover:bg-gray-800 hour-block-${h}`}
          >
            <div
              style={{ width: HEADER_HOUR_WIDTH }}
              className={classNames(
                'text-center text-sm border-r-2 border-r-gray-500',
                {
                  'text-rose-300': h === new Date().getHours(),
                }
              )}
            >{`${h}h`}</div>
            <div
              className={classNames(
                'border-b-2 border-r-2 border-gray-700 w-full h-full cursor-pointer',
                {
                  'border-t-2 border-t-gray-700 rounded-tr': h === 0,
                  'rounded-br': h === 23,
                }
              )}
              onClick={() => {
                const start = selectedDate.date.hour(h).startOf('hour');
                router.replace({
                  pathname: router.pathname,
                  query: {
                    ...router.query,
                    new_task: `${start.valueOf()}:${start
                      .add(1, 'h')
                      .valueOf()}`,
                  },
                });
              }}
            ></div>
          </div>
        ))}

        {/* Slots */}
        {heightSizedTasks.map(
          ({ overflowAfter, overflowBefore, id, task, height, top }) => {
            return (
              <div
                key={task.id}
                id={id}
                className={classNames(
                  'task-item absolute bg-gray-500 px-4 py-1 cursor-pointer hover:bg-gray-400 transition',
                  {
                    'rounded-t': !overflowBefore,
                    'rounded-b': !overflowAfter,
                  }
                )}
                style={{
                  top,
                  height,
                }}
              >
                <span className="font-bold">{task.title}</span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};
