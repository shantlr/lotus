import { classed } from '@/components/base/classed';
import { TaskDetails } from '@/components/taskDetails';
import { CalendarTasksQuery } from '@/gql/__generated/client/graphql';
import classNames from 'classnames';
import { ComponentProps, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';

const Base = classed(
  'div',
  'overflow-hidden task-item bg-gray-500 cursor-pointer hover:bg-gray-400 transition drop-shadow'
);

export const BaseTaskItem = ({
  taskId,
  ...props
}: {
  taskId: string;
} & ComponentProps<typeof BaseTaskItem>) => {
  const [show, setShow] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [popupRef, setPopupRef] = useState<HTMLElement | null>(null);
  const [popupArrow, setPopupArrow] = useState<HTMLElement | null>(null);

  const popper = usePopper(containerRef, popupRef, {
    strategy: 'absolute',
    modifiers: [
      { name: 'offset', options: { offset: [0, 10] } },
      // { name: 'arrow', options: { element: popupArrow, padding: 5 } },
    ],
  });

  useEffect(() => {
    if (!show) {
      return;
    }

    const listener = (e: MouseEvent) => {
      if (
        containerRef &&
        popupRef &&
        !containerRef.contains(e.target as HTMLElement) &&
        !popupRef?.contains(e.target as HTMLElement)
      ) {
        setShow(false);
      }
    };

    window.addEventListener('click', listener);
    return () => window.removeEventListener('click', listener);
  }, [containerRef, popupRef, show]);

  return (
    <>
      <Base
        ref={setContainerRef}
        onClick={(e) => {
          e.preventDefault();
          setShow(!show);
        }}
        {...props}
      />
      {show &&
        createPortal(
          <div
            className="shadow-xl z-50"
            style={popper.styles.popper}
            {...popper.attributes.popper}
            ref={setPopupRef}
          >
            <div
              ref={setPopupArrow}
              data-popper-arrow
              style={popper.styles.arrow}
            />
            <TaskDetails taskId={taskId} onClose={() => setShow(false)} />
          </div>,
          document.body
        )}
    </>
  );
};

export const CalendarTask = ({
  task,
  className,
  ...props
}: {
  task: CalendarTasksQuery['tasks'][number];
} & ComponentProps<typeof BaseTaskItem>) => {
  return (
    <BaseTaskItem
      taskId={task.id}
      className={classNames('rounded', className)}
      {...props}
    >
      {task.title}
    </BaseTaskItem>
  );
};

export const AnchoredTaskItem = ({
  className,
  task,
  ...props
}: {
  task: CalendarTasksQuery['tasks'][number];
} & ComponentProps<typeof BaseTaskItem>) => {
  return (
    <BaseTaskItem
      taskId={task.id}
      className={classNames('text-xs rounded px-4 py-1', className)}
      {...props}
    >
      {task.title}
    </BaseTaskItem>
  );
};
