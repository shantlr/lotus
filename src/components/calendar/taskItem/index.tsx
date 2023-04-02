import { CalendarTasksQuery } from '@/gql/__generated/client/graphql';
import classNames from 'classnames';
import { ComponentProps } from 'react';

export const BaseTaskItem = ({
  className,
  ...props
}: ComponentProps<'div'>) => {
  return (
    <div
      className={classNames(
        'overflow-hidden task-item bg-gray-500 cursor-pointer hover:bg-gray-400 transition',
        className
      )}
      {...props}
    />
  );
};

export const CalendarTask = ({
  task,
  className,
  ...props
}: {
  task: CalendarTasksQuery['tasks'][number];
} & ComponentProps<typeof BaseTaskItem>) => {
  return (
    <BaseTaskItem className={classNames('rounded', className)} {...props}>
      {task.title}
    </BaseTaskItem>
  );
};

export const AnchoredTaskItem = ({
  className,
  task,
  ...props
}: {
  task: CalendarTasksQuery['tasks'][number];
} & ComponentProps<typeof BaseTaskItem>) => {
  return (
    <BaseTaskItem
      className={classNames('text-xs rounded px-4 py-1', className)}
      {...props}
    >
      {task.title}
    </BaseTaskItem>
  );
};
