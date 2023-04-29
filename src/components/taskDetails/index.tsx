import { forwardRef, useMemo } from 'react';
import { Button } from '../base/button';
import { FaTimes, FaTrash } from 'react-icons/fa';
import dayjs from 'dayjs';
import { graphql } from '@/gql/__generated/client';
import { useMutation, useQuery } from 'urql';
import { QUERY_TASK_DETAIL } from './query';
import { Input } from '../base/input';
import { IconButton } from '../base/iconButton';
import { useOnBlurChange } from '../base/hooks/useOnBlurChange';

const DELETE_TASK_MUTATION = graphql(`
  mutation DeleteTask($input: DeleteTaskInput!) {
    deleteTask(input: $input)
  }
`);

const UPDATE_TASK_MUT = graphql(`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      title
      start
      end
    }
  }
`);

export const TaskDetails = ({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose?: () => void;
}) => {
  const [{ data }] = useQuery({
    query: QUERY_TASK_DETAIL,
    variables: {
      id: taskId,
    },
  });

  const task = data?.task;

  const formattedDate = useMemo(() => {
    if (!task?.end || !task?.start) {
      return '';
    }

    const start = dayjs(task.start);
    const end = dayjs(task.end);

    if (start.format('DD/MM/YYYY') === end.format('DD/MM/YYYY')) {
      return `${start.format('DD/MM/YYYY')} ${dayjs(task.start).format(
        'HH:mm'
      )} - ${end.format('HH:mm')}`;
    }

    if (start.format('MM/YYYY') === end.format('MM/YYYY')) {
      return ``;
    }

    if (start.format('YYYY') === end.format('YYYY')) {
      return `${start.format('DD/MM HH:mm')} - ${end.format(
        'DD/MM/YYYY HH:mm'
      )}`;
    }

    return `${start.format('DD/MM/YYYY HH:mm')} - ${end.format(
      'DD/MM/YYYY HH:mm'
    )}`;
  }, [task?.end, task?.start]);

  const [{ fetching }, deleteTask] = useMutation(DELETE_TASK_MUTATION);
  const [{}, updateTask] = useMutation(UPDATE_TASK_MUT);
  const title = useOnBlurChange(
    task?.title,
    (val) => {
      if (val && task) {
        updateTask({ input: { id: task.id, title: val } });
      }
    },
    { blurOnEnter: true, escapeCancel: true }
  );

  if (!task) {
    return null;
  }

  return (
    <div className="min-w-[200px] bg-white rounded p-2 text-slate-500">
      <div className="flex items-center justify-center">
        <Input t="ghost" className="m-auto flex-grow" {...title} />
        {onClose && (
          <IconButton
            className="ml-2"
            icon={FaTimes}
            onClick={() => onClose()}
          />
        )}
      </div>
      <div className="text-sm text-slate-400">{formattedDate}</div>

      <div className="pt-4">
        <Button
          t="danger"
          className="py-2 px-8"
          onClick={() => {
            deleteTask({
              input: {
                id: task.id,
              },
            });
          }}
        >
          <FaTrash className="text-sm" />
        </Button>
      </div>
    </div>
  );
};
