import { forwardRef, useMemo } from 'react';
import { Button } from '../base/button';
import { FaTimes, FaTrash } from 'react-icons/fa';
import dayjs from 'dayjs';
import { graphql } from '@/gql/__generated/client';
import { useMutation } from 'urql';

const DELETE_TASK_MUTATION = graphql(`
  mutation DeleteTask($input: DeleteTaskInput!) {
    deleteTask(input: $input)
  }
`);

export const TaskDetails = ({
  task,
  onClose,
}: {
  task: {
    id: string;
    title: string;
    start: Date;
    end: Date;
  };
  onClose?: () => void;
}) => {
  const formattedDate = useMemo(() => {
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
  }, [task.end, task.start]);

  const [{ fetching }, deleteTask] = useMutation(DELETE_TASK_MUTATION);

  return (
    <div className="min-w-[200px] bg-white rounded p-2 text-slate-500">
      <div className="flex items-center justify-center">
        <div className="m-auto flex-grow">{task.title}</div>
        {onClose && (
          <FaTimes
            className="cursor-pointer hover:text-slate-300 transition"
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
