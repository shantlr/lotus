import classNames from 'classnames';
import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import { BASE_STYLES } from '../styles';

const STYLE = {
  highlight: `${BASE_STYLES.highlightAction.base}`,
  default: `${BASE_STYLES.defaultAction.base}`,
  light: `${BASE_STYLES.lightAction.base}`,
  danger: `${BASE_STYLES.dangerAction.base}`,
  ghost: `${BASE_STYLES.defaultAction.ghost}`,
};

export const ActionItem = ({
  t,
  className,
  ...props
}: { t?: keyof typeof STYLE } & ComponentProps<'div'>) => {
  return (
    <div
      className={classNames(
        t && t in STYLE ? STYLE[t] : STYLE.default,
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
      highlight,
      t,
      ...props
    }: {
      t?: keyof typeof STYLE;
      highlight?: boolean;
      round?: boolean;
    } & ComponentProps<'button'>,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <button
        ref={ref}
        className={classNames(
          'transition disabled:cursor-not-allowed',
          highlight
            ? STYLE['highlight']
            : typeof t === 'string' && t in STYLE
            ? STYLE[t]
            : STYLE['default'],
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
