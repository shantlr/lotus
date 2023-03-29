import { graphql } from '@/gql/__generated/client';
import dayjs from 'dayjs';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useMutation } from 'urql';
import { Button } from '../base/button';
import { Input } from '../base/input';

const CREATE_TASK = graphql(`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      task {
        id
        title
      }
    }
  }
`);

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm';

export const CreateTaskPane = ({
  initial,
  onClose,
}: {
  initial?: {
    title?: string;
    start?: Date;
    end?: Date;
  };
  onClose?: () => void;
}) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [start, setStart] = useState<string>(() =>
    dayjs(initial?.start ?? undefined).format(DATE_FORMAT)
  );
  const [end, setEnd] = useState<string>(() =>
    dayjs(initial?.end ?? undefined).format(DATE_FORMAT)
  );

  const [{}, createTask] = useMutation(CREATE_TASK);

  return (
    <div className="w-full border-l-2 border-l-gray-900 px-4 py-2">
      <div className="">
        <Button
          round
          onClick={() => {
            onClose?.();
          }}
        >
          <FaTimes />
        </Button>
        <span className="pl-4 font-bold">New Task</span>
      </div>

      <div className="pt-4">
        <Input
          value={title}
          onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
          placeholder="Title"
        />
      </div>
      <div className="pt-2">
        <span className="inline-block w-[50px]">Start</span>
        <Input
          type="datetime-local"
          value={start}
          onChange={(e) => {
            setStart(e.target.value);
          }}
        />
      </div>
      <div className="pt-2">
        <span className="inline-block w-[50px]">End</span>
        <Input
          type="datetime-local"
          value={end}
          onChange={(e) => {
            setEnd(e.target.value);
          }}
        />
      </div>
      <div>
        <Button
          highlight
          disabled={!title || !start || !end}
          className="mt-2"
          onClick={async () => {
            await createTask({
              input: {
                title,
                startDate: dayjs(start, DATE_FORMAT).toDate(),
                endDate: dayjs(end, DATE_FORMAT).toDate(),
              },
            });
          }}
        >
          Create task
        </Button>
      </div>
    </div>
  );
};
