import { MouseEvent, useMemo, useRef } from 'react';
import { OnCreateTask } from './types';

export const useClickToCreateTask = ({
  onCreateTask,
}: {
  onCreateTask?: OnCreateTask;
}) => {
  const ref = useRef<{ start: number; end: number } | null>(null);
  return useMemo(
    () => ({
      onMouseDown: (event: MouseEvent) => {
        if (event.defaultPrevented) {
          return;
        }
        const div = event.target as HTMLDivElement;

        const start = Number(
          div.attributes.getNamedItem('data-slot-start')?.value
        );

        if (isFinite(start)) {
          ref.current = {
            start,
            end: Number(div.attributes.getNamedItem('data-slot-end')?.value),
          };
          event.preventDefault();
          onCreateTask?.({
            start: new Date(start),
            end: new Date(ref.current.end as number),
            elem: div,
          });
          window.addEventListener(
            'mouseup',
            () => {
              ref.current = null;
            },
            { once: true }
          );
        } else {
          ref.current = null;
        }
      },
      onMouseEnter: (event: MouseEvent) => {
        if (!ref.current) {
          return;
        }

        const div = event.target as HTMLDivElement;

        const end = Number(div.attributes.getNamedItem('data-slot-end')?.value);
        if (isFinite(end) && end > ref.current.start) {
          ref.current.end = end;
          event.preventDefault();
          onCreateTask?.({
            start: new Date(ref.current.start),
            end: new Date(ref.current.end),
            elem: div,
          });
        }
        event.preventDefault();
        return;
      },
    }),
    [onCreateTask]
  );
};
