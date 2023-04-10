import classNames from 'classnames';
import { ComponentProps, createElement, forwardRef } from 'react';

export function classed<T extends keyof JSX.IntrinsicElements>(
  elemType: T,
  className?: string
) {
  // eslint-disable-next-line react/display-name
  return forwardRef((props: ComponentProps<T>, ref) => {
    return createElement(elemType, {
      ...props,
      className: classNames(className, props.className),
      ref,
    });
  });
}
