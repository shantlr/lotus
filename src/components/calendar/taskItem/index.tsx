import { classed } from '@/components/base/classed';
import { Popper } from '@/components/base/popper';
import { TaskDetails } from '@/components/taskDetails';
import { CalendarTasksQuery } from '@/gql/__generated/client/graphql';
import classNames from 'classnames';
import { ComponentProps, useState } from 'react';

const Base = classed(
  'div',
  'overflow-hidden task-item bg-gray-500 cursor-pointer hover:bg-gray-400 transition drop-shadow'
);

export const BaseTaskItem = ({
  taskId,
  ...props
}: {
  taskId: string;
} & ComponentProps<typeof Base>) => {
  const [show, setShow] = useState(false);

  return (
    <Popper
      show={show}
      options={{
        modifiers: [
          {
            name: 'offset',
            options: { offset: [0, 10] },
          },
        ],
      }}
      popper={
        <div className="shadow-xl z-50">
          <TaskDetails taskId={taskId} onClose={() => setShow(false)} />
        </div>
      }
    >
      <Base
        onClick={(e) => {
          e.preventDefault();
          setShow(!show);
        }}
        {...props}
      />
    </Popper>
  );
};

export const CalendarTask = ({
  task,
  className,
  ...props
}: {
  task: CalendarTasksQuery['tasks'][number];
} & Omit<ComponentProps<typeof BaseTaskItem>, 'taskId'>) => {
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
} & Omit<ComponentProps<typeof BaseTaskItem>, 'taskId'>) => {
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
