import classNames from 'classnames';
import { ComponentProps, ForwardedRef, forwardRef } from 'react';

const STYLE = {
  highlight: 'button-highlight',
  default: 'button-default',
  ghost: 'button-ghost',
  light: 'button-light',
  danger: 'button-danger',
  'white-ghost': 'button-white-ghost',
  'white-ghost-light': 'button-white-ghost-light',
};

export const ActionItem = ({
  t,
  className,
  active,
  disabled,
  ...props
}: {
  t?: keyof typeof STYLE;
  active?: boolean;
  disabled?: boolean;
} & ComponentProps<'div'>) => {
  return (
    <div
      className={classNames(
        t && t in STYLE ? STYLE[t] : STYLE.default,
        active && 'active',
        disabled && 'disabled',
        className
      )}
      role="button"
      tabIndex={-1}
      {...props}
    ></div>
  );
};

export const Button = forwardRef(
  (
    {
      className,
      round,
      t,
      ...props
    }: {
      t?: keyof typeof STYLE;
      round?: boolean;
    } & ComponentProps<'button'>,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <button
        ref={ref}
        className={classNames(
          `transition disabled:cursor-not-allowed ${STYLE[t || 'default']}`,
          {
            'rounded px-2 py-1': !round,
            'rounded-full px-2 py-2': round,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
