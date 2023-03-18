import classNames from 'classnames';
import { ComponentProps } from 'react';

export const Input = ({ className, ...props }: ComponentProps<'input'>) => {
  return (
    <input
      className={classNames(
        'border border-gray-500 rounded px-4 py-1',
        className
      )}
      {...props}
    />
  );
};
