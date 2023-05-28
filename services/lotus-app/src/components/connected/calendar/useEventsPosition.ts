import { GetCalendarEventsQuery } from '@/gql/__generated/client/graphql';
import dayjs, { Dayjs } from 'dayjs';
import { flatMap, groupBy, map, partition } from 'lodash';
import { useMemo } from 'react';

export type Event = GetCalendarEventsQuery['calendarEvents'][number];
export type SlotSpacing = {
  collidingEventsXDivider?: number;
  hourSlotPaddingBottom?: number;
  hourSlotPaddingRight?: number;
};

/**
 * Split events that are multi days from single day events
 */
export const usePartitionEvents = <T extends { start?: Date; end?: Date }>({
  events,
  currentRangeStart,
  currentRangeEnd,
}: {
  events?: T[];
  currentRangeStart: Date | Dayjs;
  currentRangeEnd: Date | Dayjs;
}) => {
  return useMemo(() => {
    return partition(events, (t) => {
      if (dayjs(t.start).isSame(dayjs(t.end), 'day')) {
        return true;
      }

      const start =
        dayjs(t.start).valueOf() < currentRangeStart.valueOf()
          ? dayjs(currentRangeStart)
          : dayjs(t.start);
      const end =
        dayjs(t.end).valueOf() > currentRangeEnd.valueOf()
          ? dayjs(currentRangeEnd)
          : dayjs(t.end);

      return start.isSame(end, 'day');
    });
  }, [currentRangeEnd, currentRangeStart, events]);
};

export const usePositionedEvents = ({
  events,
  hourSlotHeight,
  hourSlotWidth,
  currentRangeStart,
  currentRangeEnd,
  eventMinHeight,
  spacing,
}: {
  currentRangeEnd: Date | Dayjs;
  currentRangeStart: Date | Dayjs;
  events: Event[];
  hourSlotHeight: number;
  hourSlotWidth?: number;
  eventMinHeight: number;
  spacing: SlotSpacing;
}) => {
  // map events with meta and group them by days
  const eventsByDay = useMemo(() => {
    const rangeStart = dayjs(currentRangeStart);
    const rangeEnd = dayjs(currentRangeEnd);
    const mappedEvents = events.map((e) => {
      const eventStart = dayjs(e.start);
      const eventEnd = dayjs(e.end);

      const overflowAfter = eventStart.valueOf() < rangeStart.valueOf();
      const overflowBefore = eventEnd.valueOf() > rangeEnd.valueOf();

      const start = overflowBefore ? rangeStart : eventStart;
      const end = overflowAfter ? rangeEnd : eventEnd;

      return {
        event: e,
        start,
        end,
        leftOffset: eventStart.diff(rangeStart, 'day'),
        overflowAfter,
        overflowBefore,

        // Note: top and height are deterministic
        top: (start.hour() + start.minute() / 60) * hourSlotHeight,
        height: Math.max(
          eventMinHeight,
          (end.diff(start, 'minute') / 60) * hourSlotHeight
        ),

        usedSlots: [] as {
          top: number;
          height: number;
          events: any[];
          divider: number;
        }[],

        divider: 1,
      };
    });

    return groupBy(mappedEvents, (e) => dayjs(e.start).format('DD/MM/YYYY'));
  }, [
    currentRangeEnd,
    currentRangeStart,
    hourSlotHeight,
    eventMinHeight,
    events,
  ]);

  return useMemo(() => {
    if (!hourSlotWidth) {
      return [];
    }
    // Adapt top and height for each day
    return flatMap(eventsByDay, (dayEvents) => {
      type Slot = {
        top: number;
        height: number;
        events: typeof dayEvents;
        /**
         * one event size = slotWidth / divider
         */
        divider: number;
      };
      const slots: Slot[] = [];

      dayEvents.forEach((event) => {
        pushEventIntoSlots(slots, event);
      });

      // We have to compute divider multple times
      dayEvents.forEach((d) => {
        d.divider = Math.max(...d.usedSlots.map((s) => s.events.length));
      });
      slots.forEach((s) => {
        s.divider = Math.max(...s.events.map((t) => t.divider));
      });
      dayEvents.forEach((d) => {
        d.divider = Math.max(...d.usedSlots.map((s) => s.divider));
      });

      const eventMap: Record<
        string,
        {
          event: Event;
          overflowBefore: boolean;
          overflowAfter: boolean;
          top: number;
          height: number;
          width: number;
          // actual left
          left: number;
          // left relative to slot
          slotLeft: number;
        }
      > = {};
      slots.forEach((slot) => {
        const slotBaseWidth =
          hourSlotWidth - (spacing.hourSlotPaddingRight || 0);
        const spaceLeft = [
          {
            left: 0,
            width: slotBaseWidth,
          },
        ];
        const widthDivider = Math.max(...slot.events.map((e) => e.divider));
        slot.events.forEach((e, i) => {
          const {
            event,
            top,
            height,
            leftOffset,
            usedSlots,
            overflowAfter,
            overflowBefore,
          } = e;
          if (event.id in eventMap) {
            claimSpaceLeft(spaceLeft, eventMap[event.id]);
            return;
          }

          const maxWidth = slotBaseWidth / widthDivider;

          const isLast = usedSlots.every((s) => {
            const idx = s.events.indexOf(e);
            return idx + 1 === s.events.length;
          });
          const { left, width } = pickSpaceLeft(
            spaceLeft,
            { maxWidth },
            !isLast
          );

          eventMap[event.id] = {
            event,
            overflowAfter,
            overflowBefore,
            top,
            height,
            width: width,
            slotLeft: left,
            left: leftOffset * hourSlotWidth + left,
          };
        });
      });

      return map(eventMap, (t) => ({
        ...t,
        height: t.height - (spacing.hourSlotPaddingBottom || 0),
        width: t.width - (spacing.collidingEventsXDivider || 0),
      }));
    });
  }, [
    hourSlotWidth,
    spacing.collidingEventsXDivider,
    spacing.hourSlotPaddingBottom,
    spacing.hourSlotPaddingRight,
    eventsByDay,
  ]);
};

export function pushEventIntoSlots<
  T extends {
    top: number;
    height: number;
    usedSlots: { top: number; height: number; events: any[] }[];
  }
>(slots: { top: number; height: number; events: T[] }[], dayEvent: T) {
  let top = dayEvent.top;
  let end = dayEvent.top + dayEvent.height;

  for (let i = 0; i < slots.length; i += 1) {
    if (top >= end) {
      return;
    }

    const slot = slots[i];

    if (end < slot.top) {
      // insert before
      slots.splice(
        i,
        0,
        createSlot(
          {
            top,
            height: end - top,
          },
          dayEvent
        )
      );
      return;
    }
    if (top >= slot.top + slot.height) {
      // event is after current slot
      continue;
    }

    if (top < slot.top) {
      slots.splice(
        i,
        0,
        createSlot(
          {
            top,
            height: slot.top - top,
          },
          dayEvent
        )
      );
      top = slot.top;
      continue;
    }
    if (top > slot.top) {
      slots.splice(
        i,
        0,
        createSlot({
          top: slot.top,
          height: top - slot.top,
          events: slot.events,
        })
      );
      slot.height -= top - slot.top;
      slot.top = top;
      continue;
    }

    // same top
    if (end === slot.top + slot.height) {
      // same slot
      slot.events = [...slot.events, dayEvent];
      dayEvent.usedSlots.push(slot);
      return;
    }

    if (end < slot.top + slot.height) {
      slots.splice(
        i,
        0,
        createSlot(
          {
            top,
            height: end - top,
            events: slot.events,
          },
          dayEvent
        )
      );
      slot.height -= end - slot.top;
      slot.top = end;
      // => event fully merged
      return;
    }

    // end > slot end
    top = slot.top + slot.height;
    slot.events = slot.events.concat(dayEvent);
    dayEvent.usedSlots.push(slot);
    // event not fully merged
  }

  if (top !== end) {
    slots.push(
      createSlot(
        {
          top,
          height: end - top,
        },
        dayEvent
      )
    );
  }
}

function createSlot<
  T extends { usedSlots: {}[] },
  Slot extends { top: number; height: number; events?: T[] }
>(slot: Slot, event?: T) {
  if (event) {
    slot.events = slot?.events?.concat(event) ?? [event];
  }
  slot.events?.forEach((t) => {
    t.usedSlots.push(slot);
  });
  return slot as Omit<Slot, 'events'> & { events: T[] };
}

function pickSpaceLeft(
  spaces: { left: number; width: number }[],
  item: { maxWidth: number },
  otherItemLeft?: boolean
) {
  if (!spaces.length) {
    // Unexpected
    return { left: 0, width: 0 };
  }

  const space = spaces[0];
  const res = {
    left: space.left,
    width: otherItemLeft ? Math.min(space.width, item.maxWidth) : space.width,
  };
  if (res.width < space.width) {
    space.left = res.left + res.width;
    space.width -= res.width;
  } else {
    spaces.splice(0, 1);
  }

  return res;
}
function claimSpaceLeft(
  spaces: { left: number; width: number }[],
  item: { width: number; slotLeft: number }
) {
  for (let i = 0; i < spaces.length; i += 1) {
    const space = spaces[i];
    if (item.slotLeft > space.left + space.width) {
      continue;
    }
    if (item.slotLeft + item.width < space.left) {
      return;
    }
    if (item.slotLeft > space.left) {
      spaces.splice(i, 0, {
        left: space.left,
        width: item.slotLeft - space.left,
      });
      space.width -= item.slotLeft - space.left;
      space.left = item.slotLeft;
      continue;
    }
    if (item.slotLeft + item.width < space.left + space.width) {
      const delta = item.slotLeft + item.width - space.left;
      space.left += delta;
      space.width -= delta;
      return;
    }

    spaces.splice(i, 1);
    i -= 1;
  }
}
