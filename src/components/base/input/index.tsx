import classNames from 'classnames';
import { ComponentProps, forwardRef } from 'react';

export const BaseInput = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={classNames(
          'border-2 hover:border-2 border-gray-200 hover:px-4 focus:px-4 rounded px-4 py-1 text-gray-500 hover:border-highlight-light outline-none focus:border-highlight transition-all hover:shadow',
          className
        )}
        {...props}
      />
    );
  }
);
BaseInput.displayName = 'BaseInput';

export const Input = forwardRef<
  HTMLInputElement,
  { t?: 'ghost' } & ComponentProps<'input'>
>(({ t, className, ...props }, ref) => {
  return (
    <BaseInput
      // @ts-ignore
      ref={ref}
      className={classNames(className, {
        'border-transparent px-0': t === 'ghost',
      })}
      {...props}
    />
  );
});
Input.displayName = 'Input';
