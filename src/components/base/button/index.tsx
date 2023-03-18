import classNames from 'classnames';
import { ComponentProps } from 'react';

export const Button = ({ className, ...props }: ComponentProps<'button'>) => {
  return (
    <button
      className={classNames(
        'px-4 py-1 bg-gray-600 rounded hover:bg-gray-500 active:bg-gray-700',
        'disabled:bg-gray-800 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};
