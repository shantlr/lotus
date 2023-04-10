import classNames from 'classnames';
import { ComponentProps } from 'react';

export const SlotPlaceholder = ({
  className,
  selected,
  ...props
}: { selected?: boolean } & ComponentProps<'div'>) => {
  return (
    <div
      className={classNames(
        'border-b-2 border-r-2 border-gray-700 w-full h-full hover:bg-gray-800 cursor-pointer transition',
        {
          'bg-gray-800': selected,
        },
        className
      )}
      {...props}
    />
  );
};
