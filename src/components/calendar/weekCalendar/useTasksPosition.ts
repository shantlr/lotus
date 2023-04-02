import { CalendarTasksQuery } from '@/gql/__generated/client/graphql';
import dayjs from 'dayjs';
import { flatMap, groupBy, last, partition } from 'lodash';
import { useMemo } from 'react';

export const usePartitionTasks = <T extends { start?: Date; end?: Date }>({
  tasks,
}: {
  tasks?: T[];
}) => {
  return partition(tasks, (t) => {
    return (
      dayjs(t.start).format('DD/MM/YYYY') === dayjs(t.end).format('DD/MM/YYYY')
    );
  });
};

type Task = CalendarTasksQuery['tasks'][number];

type CollidingTaskNode = {
  task: Task;
  height: number;
  top: number;
  width: number;
  leftOffset: number;

  overflowAfter: boolean;
  overflowBefore: boolean;

  /**
   * all direct children are colliding with current node but not between themselves
   */
  children: CollidingTaskNode[];
  /**
   * max nested depth
   */
  childrenDepth: number;
};

const pushCollidingNode = (
  tree: CollidingTaskNode,
  node: CollidingTaskNode
): number => {
  if (
    !tree ||
    node.top >= tree.top + tree.height ||
    node.top + node.height <= tree.top
  ) {
    return 0;
  }

  for (const c of tree.children) {
    const depth = pushCollidingNode(c, node);
    if (depth) {
      tree.childrenDepth = Math.max(tree.childrenDepth, depth + 1);
      return tree.childrenDepth;
    }
  }

  tree.children.push(node);
  if (!tree.childrenDepth) {
    tree.childrenDepth = 1;
  }
  return tree.childrenDepth;
};

const computeTaskRect = (
  node: CollidingTaskNode,
  left: number,
  widthLeft: number
) => {
  const nbItemsInSlot = 1 + node.childrenDepth;
  const item = {
    task: node.task,
    top: node.top,
    height: node.height,
    left: left,
    width: widthLeft / nbItemsInSlot,
  };

  const res = [item];
  for (const c of node.children) {
    const r = computeTaskRect(
      c,
      item.left + item.width + 2,
      widthLeft - item.width - 2
    );
    res.push(...r);
  }
  return res;
};

export const usePositionedTasks = ({
  tasks,
  hourSlotHeight,
  hourSlotWidth,
  currentRangeStart,
  currentRangeEnd,
}: {
  currentRangeEnd: Date;
  currentRangeStart: Date;
  tasks: CalendarTasksQuery['tasks'];
  hourSlotHeight: number;
  hourSlotWidth?: number;
}) => {
  const tasksByDay = useMemo(
    () => groupBy(tasks, (t) => dayjs(t.start).format('DD/MM/YYYY')),
    [tasks]
  );

  const collidingTaskTrees = useMemo(() => {
    // compute top + height
    return flatMap(tasksByDay, (sameDayTasks) => {
      const roots: CollidingTaskNode[] = [];

      //#region compute collision tree
      sameDayTasks.forEach((t) => {
        const overflowBefore =
          currentRangeStart.valueOf() > dayjs(t.start).valueOf();
        const overflowAfter =
          currentRangeEnd.valueOf() < dayjs(t.end).valueOf();

        const start = overflowBefore
          ? dayjs(currentRangeStart)
          : dayjs(t.start);
        const end = overflowAfter ? dayjs(currentRangeEnd) : dayjs(t.end);

        const top =
          (start.get('hour') + start.get('minute') / 60) * hourSlotHeight;

        const height = (end.diff(start, 'minute') / 60) * hourSlotHeight;

        const node: CollidingTaskNode = {
          task: t,

          top,
          height,
          leftOffset: end.diff(currentRangeStart, 'day'),
          width: 0,

          overflowAfter,
          overflowBefore,

          children: [],
          childrenDepth: 0,
        };
        for (const r of roots) {
          if (pushCollidingNode(r, node)) {
            return node;
          }
        }

        roots.push(node);
        return node;
      });
      //#endregion

      return roots;
    });
  }, [currentRangeEnd, currentRangeStart, hourSlotHeight, tasksByDay]);

  return useMemo(() => {
    return flatMap(collidingTaskTrees, (node) => {
      return computeTaskRect(
        node,
        node.leftOffset * (hourSlotWidth || 0),
        hourSlotWidth || 0
      );
    });
  }, [collidingTaskTrees, hourSlotWidth]);
};
