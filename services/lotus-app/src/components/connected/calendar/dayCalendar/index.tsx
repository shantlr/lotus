import clsx from 'clsx';
import dayjs from 'dayjs';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { QUERY_CAL_EVENTS } from '../query';
import { AnchoredEventItem, CalendarEvent } from '../eventItem';
// import { usePartitionEvents } from './useEventsPositions';
import { useObserveWidth } from '@/components/base/hooks';
import { useHourSlots } from '../useHourSlots';
import { SlotPlaceholder } from '../slot';
import { OnCreateEvent } from '../types';
import { useClickToCreateEvent } from '../useClickToCreateEvent';
import { usePartitionEvents, usePositionedEvents } from '../useEventsPosition';

const HOUR_HEIGHT = 100;
const HEADER_HOUR_WIDTH = 45;
const EVENT_MIN_HEIGHT = 35;

export const DayCalendar = ({
  selectedStart,
  createEventSelectedStart,
  createEventSelectedEnd,
  onCreateEvent,
  labelIds,
}: {
  selectedStart: Date;
  createEventSelectedStart?: Date | number;
  createEventSelectedEnd?: Date | number;
  onSetSelectedStart?: Date;
  onCreateEvent?: OnCreateEvent;
  labelIds?: string[] | null;
}) => {
  const input = useMemo(
    () => ({
      start: dayjs(selectedStart).startOf('day').toDate(),
      end: dayjs(selectedStart).endOf('day').toDate(),
      labelIds,
    }),
    [labelIds, selectedStart]
  );

  const [{ data }] = useQuery({
    query: QUERY_CAL_EVENTS,
    variables: {
      input,
    },
  });

  const [hoursContainer, setHourContainer] = useState<HTMLDivElement | null>(
    null
  );

  // initial auto scroll to current hour range
  useLayoutEffect(() => {
    if (hoursContainer) {
      const elem = hoursContainer.querySelector<HTMLDivElement>(
        `.hour-block-${new Date().getHours()}`
      );
      if (elem) {
        hoursContainer.scroll({
          top:
            elem.offsetTop - hoursContainer.offsetTop - elem.offsetHeight * 1.2,
        });
      }
    }
  }, [hoursContainer]);

  const selectedDateRange = useMemo(
    () => ({
      start: dayjs(selectedStart).startOf('day'),
      end: dayjs(selectedStart).endOf('day'),
    }),
    [selectedStart]
  );

  const [events, fulldayEvents] = usePartitionEvents({
    events: data?.calendarEvents,
    currentRangeStart: selectedDateRange.start,
    currentRangeEnd: selectedDateRange.end,
  });
  const hourSlotWidth = useObserveWidth(hoursContainer, '.hour-slot');

  const positionedEvents = usePositionedEvents({
    currentRangeStart: selectedDateRange.start,
    currentRangeEnd: selectedDateRange.end,
    events,
    hourSlotHeight: HOUR_HEIGHT,
    hourSlotWidth: hourSlotWidth,
    eventMinHeight: EVENT_MIN_HEIGHT,
    spacing: {
      collidingEventsXDivider: 4,
      hourSlotPaddingBottom: 2,
      hourSlotPaddingRight: 20,
    },
  });

  const slots = useHourSlots({
    day: selectedDateRange.start,
    selectedStart: createEventSelectedStart,
    selectedEnd: createEventSelectedEnd,
  });

  const clickEvents = useClickToCreateEvent({ onCreateEvent });

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <div
        className={clsx('space-y-1', {
          'pb-2': fulldayEvents.length > 0,
        })}
      >
        {fulldayEvents.map((t) => (
          <AnchoredEventItem key={t.id} event={t} />
        ))}
      </div>

      <div
        ref={setHourContainer}
        className="relative flex flex-col h-full w-full overflow-auto pr-4 pb-2"
      >
        {slots.map((s, h) => (
          <div
            key={s.key}
            style={{ height: HOUR_HEIGHT }}
            className={`flex flex-shrink-0 w-full hover:bg-gray-800 hour-block-${h}`}
          >
            {/* Left hour header */}
            <div
              style={{ width: HEADER_HOUR_WIDTH }}
              className={clsx(
                'text-center text-sm border-r-2 border-r-gray-500',
                {
                  'text-rose-300': h === new Date().getHours(),
                }
              )}
            >{`${h}h`}</div>

            {/* Slot placeholder */}
            <SlotPlaceholder
              selected={Boolean(s.selected)}
              className={clsx('hour-slot ', {
                'border-t-2 border-t-gray-700 rounded-tr': h === 0,
                'rounded-br': h === 23,
                'border-b-dashed': h < slots.length - 1,
              })}
              data-slot-start={s.start.valueOf()}
              data-slot-end={s.end.valueOf()}
              {...clickEvents}
            />
          </div>
        ))}

        {/* Events */}
        {positionedEvents.map(
          ({
            overflowAfter,
            overflowBefore,
            event,
            height,
            top,
            left,
            width,
          }) => {
            return (
              <CalendarEvent
                key={event.id}
                className={clsx(
                  'event-item whitespace-pre-line overflow-hidden break-all absolute px-4 py-1',
                  {
                    'border-dashed border-t-white border-t-[1px]':
                      overflowBefore,
                    'border-dashed border-b-white border-b-[1px]':
                      overflowAfter,
                    'rounded-t': !overflowBefore,
                    'rounded-b': !overflowAfter,
                  }
                )}
                style={{
                  top,
                  height,
                  width,
                  left: left + HEADER_HOUR_WIDTH,
                }}
                event={event}
              />
            );
          }
        )}
      </div>
    </div>
  );
};
