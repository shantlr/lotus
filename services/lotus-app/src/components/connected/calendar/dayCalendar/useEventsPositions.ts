// import { GetCalendarEventsQuery } from '@/gql/__generated/client/graphql';
// import dayjs, { Dayjs } from 'dayjs';
// import { partition } from 'lodash';
// import { nanoid } from 'nanoid';
// import { MutableRefObject, useLayoutEffect, useMemo } from 'react';

// export const usePartitionEvents = <T extends { start?: Date; end?: Date }>({
//   events,
//   start,
//   end,
// }: {
//   events?: T[];
//   start: Dayjs;
//   end: Dayjs;
// }) => {
//   return useMemo(
//     () =>
//       partition(events, (t) => {
//         return (
//           dayjs(t.start).valueOf() <= start.valueOf() &&
//           dayjs(t.end).valueOf() >= end.valueOf()
//         );
//       }),
//     [end, start, events]
//   );
// };

// export const useHeightSizedEvents = ({
//   refDay,
//   events,
//   size,
// }: {
//   refDay: Dayjs;
//   events?: GetCalendarEventsQuery['calendarEvents'];
//   size: {
//     hourSlotHeight: number;
//     eventMinHeight: number;
//     offsetLeft?: number;
//   };
// }) => {
//   return useMemo(() => {
//     if (!events?.length) {
//       return [];
//     }

//     const refDayStart = refDay.startOf('day').valueOf();
//     const refDayEnd = refDay.endOf('day').valueOf();

//     return events.map((t) => {
//       const overflowBefore = refDayStart > dayjs(t.start).valueOf();
//       const overflowAfter = refDayEnd < dayjs(t.end).valueOf();

//       const start = overflowBefore
//         ? dayjs(refDayStart).toDate()
//         : new Date(t.start);
//       const end = overflowAfter ? dayjs(refDayEnd).toDate() : new Date(t.end);
//       let height: number;

//       const startHour = start.getHours() + start.getMinutes() / 60;
//       const duration = (end.valueOf() - start.valueOf()) / (60 * 60 * 1000);
//       height = Math.max(size.eventMinHeight, size.hourSlotHeight * duration);
//       const top = startHour * size.hourSlotHeight;

//       return {
//         id: nanoid(),
//         overflowBefore,
//         overflowAfter,
//         event: t,
//         height,
//         top,
//       };
//     });
//   }, [events, refDay, size.hourSlotHeight, size.eventMinHeight]);
// };

// const isColliding = (
//   a: { top: number; left: number; height: number; width: number },
//   b: { top: number; left: number; height: number; width: number }
// ): boolean => {
//   return (
//     a.left < b.left + b.width &&
//     a.left + a.width > b.left &&
//     a.top < b.top + b.height &&
//     a.top + a.height > b.top
//   );
// };
// export const usePositionedEvents = (
//   parentRef: MutableRefObject<HTMLElement | null>,
//   /**
//    * Events are expected to be ordered
//    */
//   events: ReturnType<typeof useHeightSizedEvents>,
//   size: {
//     offsetLeft?: number;
//     spaceBetweenEvent?: number;
//   }
// ) => {
//   useLayoutEffect(() => {
//     if (!parentRef.current) {
//       return;
//     }

//     const eventWithElems: ((typeof events)[number] & {
//       width: number;
//       left: number;
//       elem: HTMLElement;
//     })[] = [];
//     let maxWidth = 0;

//     parentRef.current.querySelectorAll('.event-item').forEach((e) => {
//       const event = events.find((t) => t.id === e.id);
//       if (event) {
//         const elem = e as HTMLElement;
//         let left: number = size.offsetLeft ?? 0;
//         eventWithElems.forEach((prevEvent) => {
//           // in case of collision move event to the right
//           if (
//             isColliding(prevEvent, {
//               height: event.height,
//               left,
//               width: elem.offsetWidth,
//               top: event.top,
//             })
//           ) {
//             left =
//               prevEvent.left + prevEvent.width + (size.spaceBetweenEvent ?? 2);
//           }
//         });

//         eventWithElems.push({
//           ...event,
//           width: elem.offsetWidth,
//           left,
//           elem: elem,
//         });
//         elem.style.left = `${left}px`;
//         maxWidth = Math.max(maxWidth, elem.offsetLeft + elem.offsetWidth);
//       }
//     });

//     const parentWidth =
//       parentRef.current.offsetWidth -
//       parseInt(getComputedStyle(parentRef.current).paddingRight);

//     const slotWidth =
//       maxWidth > parentWidth ? `${maxWidth + 4}px` : `${parentWidth}px`;
//     // Update hour-slot width in case of x overflow so slot width match events width
//     parentRef.current.querySelectorAll('.hour-slot').forEach((e) => {
//       (e as HTMLElement).style.width = slotWidth;
//     });
//   }, [parentRef, size.offsetLeft, size.spaceBetweenEvent, events]);
// };
