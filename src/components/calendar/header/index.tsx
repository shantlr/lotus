import { useMemo } from 'react';
import { Button } from '../../base/button';
import { ButtonPopper } from '../../base/buttonPopper';
import { CalendarType, OnCreateTask } from '../types';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { FaCaretLeft, FaCaretRight, FaPlus } from 'react-icons/fa';
import classNames from 'classnames';
import { SelectDateRange } from './dateRange';
import { LabelSelector } from './labelSelector';

dayjs.extend(isoWeek);

export const CalendarHeader = ({
  type,
  selectedStart,
  setSelectedStart,
  setType,
  onCreateTask,
}: {
  selectedStart: Date;
  setSelectedStart: (date: Date) => void;
  type: CalendarType;
  setType: (type: CalendarType) => void;
  onCreateTask?: OnCreateTask;
}) => {
  const formatted = useMemo(() => {
    if (type === 'day') {
      return dayjs(selectedStart).format('dd DD MMM YYYY');
    } else if (type === 'week') {
      const start = dayjs(selectedStart).startOf('isoWeek');
      const end = dayjs(selectedStart).endOf('isoWeek');
      return `${start.format('DD')} - ${end.format('DD MMM YYYY')}`;
    } else if (type === 'month') {
      return dayjs(selectedStart).format('MMM YYYY');
    }
  }, [selectedStart, type]);

  const selectedDateRange = useMemo(() => {
    if (type === 'day') {
      return {
        start: dayjs(selectedStart).startOf('d'),
        end: dayjs(selectedStart).endOf('d'),
      };
    }
    if (type === 'week') {
      return {
        start: dayjs(selectedStart).startOf('isoWeek'),
        end: dayjs(selectedStart).endOf('isoWeek'),
      };
    }
    return {
      start: dayjs(selectedStart).startOf('month'),
      end: dayjs(selectedStart).endOf('month'),
    };
  }, [selectedStart, type]);

  return (
    <div className="flex py-2 border-b border-gray-800">
      <div className="w-[50px]"></div>
      <div className="flex items-center">
        <Button
          className="h-[22px] mr-2"
          onClick={() => {
            if (type === 'day') {
              setSelectedStart(
                dayjs(selectedStart).subtract(1, 'd').startOf('day').toDate()
              );
            } else if (type === 'week') {
              setSelectedStart(
                dayjs(selectedStart)
                  .subtract(1, 'w')
                  .startOf('isoWeek')
                  .toDate()
              );
            } else if (type === 'month') {
              setSelectedStart(
                dayjs(selectedStart)
                  .subtract(1, 'month')
                  .startOf('month')
                  .toDate()
              );
            }
          }}
        >
          <FaCaretLeft />
        </Button>
        <ButtonPopper
          className={classNames(
            'h-[22px] w-[140px] text-sm border-2 border-transparent select-none',
            {
              'text-highlight':
                selectedDateRange.start.valueOf() <= Date.now() &&
                selectedDateRange.end.valueOf() >= Date.now(),
              'border-l-highlight':
                Date.now() <= selectedDateRange.start.valueOf(),
              'border-r-highlight':
                Date.now() >= selectedDateRange.end.valueOf(),
            }
          )}
          popperContent={
            <SelectDateRange
              type={type}
              onSetType={setType}
              selectedDateRange={selectedDateRange}
              onSelectDateRange={(dateRange) => {
                setSelectedStart(dateRange.start);
              }}
            />
          }
        >
          {formatted}
        </ButtonPopper>
        <Button
          className="h-[22px] ml-2"
          onClick={() => {
            if (type === 'day') {
              setSelectedStart(
                dayjs(selectedStart).add(1, 'd').startOf('day').toDate()
              );
            } else if (type === 'week') {
              setSelectedStart(
                dayjs(selectedStart).add(1, 'w').startOf('isoWeek').toDate()
              );
            } else if (type === 'month') {
              setSelectedStart(
                dayjs(selectedStart).add(1, 'month').startOf('month').toDate()
              );
            }
          }}
        >
          <FaCaretRight />
        </Button>

        <Button
          t="highlight"
          round
          className="ml-8 h-[22px] w-[22px] flex items-center justify-center"
          onClick={(e) => {
            let start: Date;

            if (type === 'day') {
              // selected day + current hour
              start = dayjs(selectedStart)
                .set('h', new Date().getHours())
                .startOf('h')
                .toDate();
            } else if (type === 'week') {
              if (
                dayjs().valueOf() >=
                  dayjs(selectedStart).add(1, 'd').valueOf() &&
                dayjs().valueOf() <= dayjs(selectedStart).endOf('w').valueOf()
              ) {
                // today + current hour
                start = dayjs()
                  .set('h', new Date().getHours())
                  .startOf('h')
                  .toDate();
              } else {
                // first day of week + current hour
                start = dayjs(selectedStart)
                  .add(1, 'd')
                  .set('h', new Date().getHours())
                  .startOf('h')
                  .toDate();
              }
            } else {
              if (
                dayjs().valueOf() >=
                  dayjs(selectedStart).add(1, 'd').valueOf() &&
                dayjs().valueOf() <=
                  dayjs(selectedStart).endOf('month').valueOf()
              ) {
                // today + current hour
                start = dayjs()
                  .set('h', new Date().getHours())
                  .startOf('h')
                  .toDate();
              } else {
                // first day of week + current hour
                start = dayjs(selectedStart)
                  .add(1, 'd')
                  .set('h', new Date().getHours())
                  .startOf('h')
                  .toDate();
              }
            }

            onCreateTask?.({
              elem: e.currentTarget as HTMLElement,
              start,
              end: dayjs(start).add(1, 'h').toDate(),
            });
          }}
        >
          <FaPlus />
        </Button>

        <LabelSelector className="ml-8" />
      </div>
    </div>
  );
};
