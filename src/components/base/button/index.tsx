import classNames from 'classnames';
import { ComponentProps } from 'react';
import { BASE_STYLES } from '../styles';

const STYLE = {
  highlight: `${BASE_STYLES.highlightAction.base}`,
  default: `${BASE_STYLES.defaultAction.base}`,
  danger: `${BASE_STYLES.dangerAction.base}`,
};

export const ActionItem = ({
  className,
  noBg,
  ...props
}: { noBg?: boolean } & ComponentProps<'div'>) => {
  return (
    <div
      className={classNames(
        'hover:bg-gray-500 transition',
        {
          'bg-gray-600': !noBg,
        },
        className
      )}
      role="button"
      tabIndex={-1}
      {...props}
    ></div>
  );
};

export const Button = ({
  className,
  round,
  highlight,
  t,
  ...props
}: {
  t?: keyof typeof STYLE;
  highlight?: boolean;
  round?: boolean;
} & ComponentProps<'button'>) => {
  return (
    <button
      className={classNames(
        'transition disabled:cursor-not-allowed',
        highlight
          ? STYLE['highlight']
          : typeof t === 'string' && t in STYLE
          ? STYLE[t]
          : STYLE['default'],
        {
          'rounded px-4 py-1': !round,
          'rounded-full px-4 py-2': round,
        },
        className
      )}
      {...props}
    />
  );
};
