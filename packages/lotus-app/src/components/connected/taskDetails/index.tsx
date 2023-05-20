import { useMemo } from 'react';
import { Button } from '../../base/button';
import { FaTimes, FaTrash } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useMutation, useQuery } from 'urql';
import {
  DELETE_TASK_MUTATION,
  QUERY_TASK_DETAIL,
  UPDATE_TASK_MUT,
} from './query';
import { IconButton } from '../../base/iconButton';
import { useOnBlurChange } from '../../base/hooks/useOnBlurChange';
import { DateRangePicker } from '../../base/dateRangePicker';
import clsx from 'clsx';
import { SelectLabels } from '../selectTaskLabels';

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

  const [{ fetching: deleting }, deleteTask] =
    useMutation(DELETE_TASK_MUTATION);
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

  const labelIds = useMemo(() => task?.labels.map((l) => l.id), [task?.labels]);

  if (!task) {
    return null;
  }

  return (
    <div className="min-w-[200px] bg-white rounded p-2 text-slate-500">
      <div className="flex items-center justify-center">
        <input className="px-2 m-auto flex-grow outline-none" {...title} />
        {onClose && (
          <IconButton
            className="ml-2 mr-2"
            icon={FaTimes}
            onClick={() => onClose()}
          />
        )}
      </div>

      <DateRangePicker
        className="mt-2 mr-2"
        start={task.start}
        end={task.end}
        onChange={(range) => {
          updateTask({
            input: { id: task.id, startDate: range.start, endDate: range.end },
          });
        }}
      >
        {({ className, show, setShow }) => (
          <div
            className={clsx(
              'px-2 text-sm text-slate-400 select-none transition rounded border-2 hover:border-highlight-light cursor-pointer',
              {
                'border-transparent': !show,
                'border-highlight': show,
              },
              className
            )}
            onClick={() => {
              setShow(!show);
            }}
          >
            {formattedDate}
          </div>
        )}
      </DateRangePicker>

      <SelectLabels
        className="mt-2 w-full"
        size="sm"
        value={labelIds}
        onChange={(nextLabelIds) => {
          if (!nextLabelIds.length) {
            return;
          }
          updateTask({
            input: {
              id: task.id,
              labelIds: nextLabelIds,
            },
          });
        }}
      />

      <div className="px-2 pt-4">
        <Button
          t="danger"
          className="py-2 px-8"
          loading={deleting}
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
