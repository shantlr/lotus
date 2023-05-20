import { CalendarTasksQuery } from '@/gql/__generated/client/graphql';
import dayjs, { Dayjs } from 'dayjs';
import { flatMap, groupBy, map, partition } from 'lodash';
import { useMemo } from 'react';

export type Task = CalendarTasksQuery['tasks'][number];
export type SlotSpacing = {
  collidingTasksXDivider?: number;
  hourSlotPaddingBottom?: number;
  hourSlotPaddingRight?: number;
};

/**
 * Split tasks that are multi days from single day tasks
 */
export const usePartitionTasks = <T extends { start?: Date; end?: Date }>({
  tasks,
  currentRangeStart,
  currentRangeEnd,
}: {
  tasks?: T[];
  currentRangeStart: Date;
  currentRangeEnd: Date;
}) => {
  return useMemo(() => {
    return partition(tasks, (t) => {
      if (
        dayjs(t.start).format('DD/MM/YYYY') ===
        dayjs(t.end).format('DD/MM/YYYY')
      ) {
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

      return start.format('DD/MM/YYYY') === end.format('DD/MM/YYYY');
    });
  }, [currentRangeEnd, currentRangeStart, tasks]);
};

export const usePositionedTasks = ({
  tasks,
  hourSlotHeight,
  hourSlotWidth,
  currentRangeStart,
  currentRangeEnd,
  taskMinHeight,
  spacing,
}: {
  currentRangeEnd: Date | Dayjs;
  currentRangeStart: Date | Dayjs;
  tasks: Task[];
  hourSlotHeight: number;
  hourSlotWidth?: number;
  taskMinHeight: number;
  spacing: SlotSpacing;
}) => {
  // map tasks with meta and group them by days
  const tasksByDay = useMemo(() => {
    const rangeStart = dayjs(currentRangeStart);
    const rangeEnd = dayjs(currentRangeEnd);
    const mappedTasks = tasks.map((t) => {
      const taskStart = dayjs(t.start);
      const taskEnd = dayjs(t.end);

      const overflowAfter = taskStart.valueOf() < rangeStart.valueOf();
      const overflowBefore = taskEnd.valueOf() > rangeEnd.valueOf();

      const start = overflowBefore ? rangeStart : taskStart;
      const end = overflowAfter ? rangeEnd : taskEnd;

      return {
        task: t,
        start,
        end,
        leftOffset: taskStart.diff(rangeStart, 'day'),
        overflowAfter,
        overflowBefore,

        // Note: top and height are deterministic
        top: (start.hour() + start.minute() / 60) * hourSlotHeight,
        height: Math.max(
          taskMinHeight,
          (end.diff(start, 'minute') / 60) * hourSlotHeight
        ),

        usedSlots: [] as {
          top: number;
          height: number;
          tasks: any[];
          divider: number;
        }[],

        divider: 1,
      };
    });

    return groupBy(mappedTasks, (t) => dayjs(t.start).format('DD/MM/YYYY'));
  }, [
    currentRangeEnd,
    currentRangeStart,
    hourSlotHeight,
    taskMinHeight,
    tasks,
  ]);

  return useMemo(() => {
    if (!hourSlotWidth) {
      return [];
    }
    // Adapt top and height for each day
    return flatMap(tasksByDay, (dayTasks) => {
      type Slot = {
        top: number;
        height: number;
        tasks: typeof dayTasks;
        /**
         * one task size = slotWidth / divider
         */
        divider: number;
      };
      const slots: Slot[] = [];

      dayTasks.forEach((task) => {
        pushTaskIntoSlots(slots, task);
      });

      // We have to compute divider multple times
      dayTasks.forEach((d) => {
        d.divider = Math.max(...d.usedSlots.map((s) => s.tasks.length));
      });
      slots.forEach((s) => {
        s.divider = Math.max(...s.tasks.map((t) => t.divider));
      });
      dayTasks.forEach((d) => {
        d.divider = Math.max(...d.usedSlots.map((s) => s.divider));
      });

      const taskMap: Record<
        string,
        {
          task: Task;
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
        const widthDivider = Math.max(...slot.tasks.map((t) => t.divider));
        slot.tasks.forEach((t, i) => {
          const {
            task,
            top,
            height,
            leftOffset,
            usedSlots,
            overflowAfter,
            overflowBefore,
          } = t;
          if (task.id in taskMap) {
            claimSpaceLeft(spaceLeft, taskMap[task.id]);
            return;
          }

          const maxWidth = slotBaseWidth / widthDivider;

          const isLast = usedSlots.every((s) => {
            const idx = s.tasks.indexOf(t);
            return idx + 1 === s.tasks.length;
          });
          const { left, width } = pickSpaceLeft(
            spaceLeft,
            { maxWidth },
            !isLast
          );

          taskMap[task.id] = {
            task,
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

      return map(taskMap, (t) => ({
        ...t,
        height: t.height - (spacing.hourSlotPaddingBottom || 0),
        width: t.width - (spacing.collidingTasksXDivider || 0),
      }));
    });
  }, [
    hourSlotWidth,
    spacing.collidingTasksXDivider,
    spacing.hourSlotPaddingBottom,
    spacing.hourSlotPaddingRight,
    tasksByDay,
  ]);
};

export function pushTaskIntoSlots<
  T extends {
    top: number;
    height: number;
    usedSlots: { top: number; height: number; tasks: any[] }[];
  }
>(slots: { top: number; height: number; tasks: T[] }[], dayTask: T) {
  let top = dayTask.top;
  let end = dayTask.top + dayTask.height;

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
          dayTask
        )
      );
      return;
    }
    if (top >= slot.top + slot.height) {
      // task is after current slot
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
          dayTask
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
          tasks: slot.tasks,
        })
      );
      slot.height -= top - slot.top;
      slot.top = top;
      continue;
    }

    // same top
    if (end === slot.top + slot.height) {
      // same slot
      slot.tasks = [...slot.tasks, dayTask];
      dayTask.usedSlots.push(slot);
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
            tasks: slot.tasks,
          },
          dayTask
        )
      );
      slot.height -= end - slot.top;
      slot.top = end;
      // => task fully merged
      return;
    }

    // end > slot end
    top = slot.top + slot.height;
    slot.tasks = slot.tasks.concat(dayTask);
    dayTask.usedSlots.push(slot);
    // task not fully merged
  }

  if (top !== end) {
    slots.push(
      createSlot(
        {
          top,
          height: end - top,
        },
        dayTask
      )
    );
  }
}

function createSlot<
  T extends { usedSlots: {}[] },
  Slot extends { top: number; height: number; tasks?: T[] }
>(slot: Slot, task?: T) {
  if (task) {
    slot.tasks = slot?.tasks?.concat(task) ?? [task];
  }
  slot.tasks?.forEach((t) => {
    t.usedSlots.push(slot);
  });
  return slot as Omit<Slot, 'tasks'> & { tasks: T[] };
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
