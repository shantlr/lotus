import classNames from 'classnames';
import { ComponentProps, forwardRef } from 'react';

export const BaseInput = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    return (
      <input ref={ref} className={classNames('input', className)} {...props} />
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
