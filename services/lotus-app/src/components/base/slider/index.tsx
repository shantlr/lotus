import clsx from 'clsx';
import { ReactElement, ReactNode, isValidElement } from 'react';

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
  const steps: ReactElement[] = (
    Array.isArray(children) ? children : [children]
  ).filter((c) => isValidElement(c));

  let activeIdx = steps.findIndex((s) => s?.key === value);
  if (activeIdx === -1) {
    activeIdx = 0;
  }

  return (
    <div
      className={clsx('h-full flex overflow-x-hidden', className)}
      style={{ width }}
    >
      {steps.map((s, idx) => (
        <div
          className={clsx('transition relative w-full shrink-0', {
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
