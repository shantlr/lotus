import { CalendarTasksQuery } from '@/gql/__generated/client/graphql';
import { nanoid } from 'nanoid';
import { MutableRefObject, useLayoutEffect, useMemo } from 'react';

export const useHeightSizedTasks = ({
  data,
  size,
}: {
  data?: CalendarTasksQuery;
  size: {
    hourSlotHeight: number;
    taskMinHeight: number;
    offsetLeft?: number;
  };
}) => {
  return useMemo(() => {
    if (!data?.tasks) {
      return [];
    }
    const tasks = data.tasks.map((t) => {
      const start = new Date(t.start);
      const end = new Date(t.end);

      const startHour = start.getHours() + start.getMinutes() / 60;
      const duration = (end.valueOf() - start.valueOf()) / (60 * 60 * 1000);
      const height = Math.max(
        size.taskMinHeight,
        size.hourSlotHeight * duration
      );
      const top = startHour * size.hourSlotHeight;

      return {
        id: nanoid(),
        task: t,
        height,
        top,
      };
    });
    return tasks;
  }, [data?.tasks, size.hourSlotHeight, size.taskMinHeight]);
};

const isColliding = (
  a: { top: number; left: number; height: number; width: number },
  b: { top: number; left: number; height: number; width: number }
): boolean => {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
};
export const usePositionedTasks = (
  parentRef: MutableRefObject<HTMLElement | null>,
  /**
   * Tasks are expected to be ordered
   */
  tasks: ReturnType<typeof useHeightSizedTasks>,
  size: {
    offsetLeft?: number;
    spaceBetweenTask?: number;
  }
) => {
  useLayoutEffect(() => {
    if (!parentRef.current) {
      return;
    }

    const taskWithElems: (typeof tasks[number] & {
      width: number;
      left: number;
      elem: HTMLElement;
    })[] = [];
    let maxWidth = 0;

    parentRef.current.querySelectorAll('.task-item').forEach((e) => {
      const task = tasks.find((t) => t.id === e.id);
      if (task) {
        const elem = e as HTMLElement;
        let left: number = size.offsetLeft ?? 0;
        taskWithElems.forEach((prevTask) => {
          // in case of collision move task to the right
          if (
            isColliding(prevTask, {
              height: task.height,
              left,
              width: elem.offsetWidth,
              top: task.top,
            })
          ) {
            left =
              prevTask.left + prevTask.width + (size.spaceBetweenTask ?? 2);
          }
        });

        taskWithElems.push({
          ...task,
          width: elem.offsetWidth,
          left,
          elem: elem,
        });
        elem.style.left = `${left}px`;
        maxWidth = Math.max(maxWidth, elem.offsetLeft + elem.offsetWidth);
      }
    });

    const parentWidth =
      parentRef.current.offsetWidth -
      parseInt(getComputedStyle(parentRef.current).paddingRight);

    const slotWidth =
      maxWidth > parentWidth ? `${maxWidth + 4}px` : `${parentWidth}px`;
    // Update hour-slot width in case of x overflow so slot width match tasks width
    parentRef.current.querySelectorAll('.hour-slot').forEach((e) => {
      (e as HTMLElement).style.width = slotWidth;
    });
  }, [parentRef, size.offsetLeft, size.spaceBetweenTask, tasks]);
};
