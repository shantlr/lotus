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
  task,
  ...props
}: {
  task: CalendarTasksQuery['tasks'][number];
} & ComponentProps<typeof BaseTaskItem>) => {
  const [show, setShow] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [popupRef, setPopupRef] = useState<HTMLElement | null>(null);

  const popper = usePopper(containerRef, popupRef, {
    strategy: 'absolute',
  });

  useEffect(() => {
    if (!show) {
      return;
    }

    const listener = (e: MouseEvent) => {
      if (containerRef && !containerRef.contains(e.target as HTMLElement)) {
        setShow(false);
      }
    };

    window.addEventListener('click', listener);
    return () => window.removeEventListener('click', listener);
  }, [containerRef, show]);

  return (
    <>
      <Base
        ref={setContainerRef}
        onClick={(e) => {
          e.preventDefault();
          setShow(true);
        }}
        {...props}
      />
      {show &&
        createPortal(
          <div
            className="shadow"
            style={popper.styles.popper}
            {...popper.attributes.popper}
            ref={setPopupRef}
          >
            <TaskDetails task={task} onClose={() => setShow(false)} />
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
      task={task}
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
      task={task}
      className={classNames('text-xs rounded px-4 py-1', className)}
      {...props}
    >
      {task.title}
    </BaseTaskItem>
  );
};
