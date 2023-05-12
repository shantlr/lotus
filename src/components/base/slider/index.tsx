import classNames from 'classnames';
import { ReactElement, ReactNode, isValidElement, useMemo } from 'react';

export const Slider = ({
  width = 200,
  className,
  children,
  value,
}: {
  width?: number;
  className?: string;
  children: ReactNode;
  value?: string;
}) => {
  const steps: ReactElement[] = Array.isArray(children) ? children : [children];

  let activeIdx = steps.findIndex((s) => s.key === value);
  if (activeIdx === -1) {
    activeIdx = 0;
  }

  return (
    <div
      className={classNames('h-full flex overflow-x-hidden', className)}
      style={{ width }}
    >
      {steps.map((s, idx) => (
        <div
          className={classNames('transition relative w-full shrink-0', {
            'opacity-0': activeIdx !== idx,
          })}
          style={{ transform: `translate(-${100 * activeIdx}%, 0)` }}
          key={s.key || `@step/${idx}`}
        >
          {s}
        </div>
      ))}
    </div>
  );
};
