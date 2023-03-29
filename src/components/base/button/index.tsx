import classNames from 'classnames';
import { ComponentProps } from 'react';
import { BASE_STYLES } from '../styles';

const STYLE = {
  highlight: `${BASE_STYLES.highlightAction.base}`,
  default: `${BASE_STYLES.defaultAction.base}`,
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
        t === 'highlight' || highlight ? STYLE['highlight'] : STYLE['default'],
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
