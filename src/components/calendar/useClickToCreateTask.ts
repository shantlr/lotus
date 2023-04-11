import { MouseEvent, useMemo, useRef } from 'react';
import { OnCreateTask } from './types';

export const useClickToCreateTask = ({
  onCreateTask,
}: {
  onCreateTask?: OnCreateTask;
}) => {
  const ref = useRef<{
    firstSlot: { start: number; end: number; elem: HTMLElement };
    secondSlot?: { start: number; end: number };
  } | null>(null);
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
        const end = Number(div.attributes.getNamedItem('data-slot-end')?.value);

        if (!isFinite(start)) {
          ref.current = null;
          return;
        }

        ref.current = {
          firstSlot: {
            elem: div,
            start,
            end,
          },
        };
        event.preventDefault();
        onCreateTask?.({
          start: new Date(start),
          end: new Date(end),
          elem: div,
        });
        window.addEventListener(
          'mouseup',
          () => {
            ref.current = null;
          },
          { once: true }
        );
      },
      onMouseEnter: (event: MouseEvent) => {
        if (!ref.current) {
          return;
        }

        const div = event.target as HTMLDivElement;

        const start = Number(
          div.attributes.getNamedItem('data-slot-start')?.value
        );
        const end = Number(div.attributes.getNamedItem('data-slot-end')?.value);
        if (!isFinite(end)) {
          return;
        }

        ref.current.secondSlot = {
          start,
          end,
        };

        if (start < ref.current.firstSlot.start) {
          onCreateTask?.({
            start: new Date(start),
            end: new Date(ref.current.firstSlot.end),
            elem: ref.current.firstSlot.elem,
          });
        } else {
          onCreateTask?.({
            start: new Date(ref.current.firstSlot.start),
            end: new Date(end),
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
