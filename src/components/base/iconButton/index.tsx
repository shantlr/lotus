import clsx from 'clsx';
import { ComponentProps } from 'react';
import { IconType } from 'react-icons';

export const IconButton = ({
  icon: Icon,
  className,
  active,
  ...props
}: { active?: boolean; icon: IconType } & ComponentProps<IconType>) => {
  return (
    <Icon
      role="button"
      tabIndex={-1}
      className={clsx(
        `cursor-pointer hover:text-highlight-! transition outline-none`,
        { 'text-highlight': active, 'text-gray-500': !active },
        className
      )}
      {...props}
    />
  );
};
