import classNames from 'classnames';
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
      className={classNames(
        `cursor-pointer hover:text-highlight-300 transition outline-none`,
        { 'text-highlight-300': active },
        className
      )}
      {...props}
    />
  );
};
