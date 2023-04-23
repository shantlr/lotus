import classNames from 'classnames';
import { ComponentProps } from 'react';

export const Input = ({ className, ...props }: ComponentProps<'input'>) => {
  return (
    <input
      className={classNames(
        'border-2 border-gray-200 rounded px-4 py-1 text-gray-500 hover:border-highlight-light outline-none focus:border-highlight transition hover:shadow',
        className
      )}
      {...props}
    />
  );
};
