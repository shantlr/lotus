import classNames from 'classnames';
import { ComponentProps } from 'react';

export const BaseTaskItem = ({
  className,
  ...props
}: ComponentProps<'div'>) => {
  return (
    <div
      className={classNames(
        'task-item bg-gray-500 px-4 py-1 cursor-pointer hover:bg-gray-400 transition',
        className
      )}
      {...props}
    />
  );
};

export const AnchoredTaskItem = ({
  className,
  ...props
}: ComponentProps<typeof BaseTaskItem>) => {
  return (
    <BaseTaskItem
      className={classNames('text-xs rounded', className)}
      {...props}
    />
  );
};
