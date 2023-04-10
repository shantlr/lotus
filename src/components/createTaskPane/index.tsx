import { graphql } from '@/gql/__generated/client';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useMutation } from 'urql';
import { Button } from '../base/button';
import { Input } from '../base/input';
import { usePopper } from 'react-popper';
import { createPortal } from 'react-dom';

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

export const CreateTaskPaneForm = ({
  start,
  title,
  end,
  onClose,
  onTitleChange,
  onEndChange,
  onStartChange,
  onSubmit,
}: {
  title?: string;
  start?: Date | number;
  end?: Date | number;
  onClose?: () => void;
  onTitleChange?: (title: string) => void;
  onStartChange?: (date: Date) => void;
  onEndChange?: (date: Date) => void;
  onSubmit?: (value: { title: string; start: Date; end: Date }) => void;
}) => {
  return (
    <div className="w-full max-w-[280px]">
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
          value={title || ''}
          onChange={(e) =>
            onTitleChange?.((e.target as HTMLInputElement).value)
          }
          placeholder="Title"
        />
      </div>
      <div className="pt-2">
        <span className="inline-block w-[50px]">Start</span>
        <Input
          type="datetime-local"
          value={dayjs(start).format(DATE_FORMAT)}
          onChange={(e) => {
            onStartChange?.(dayjs(e.target.value, DATE_FORMAT).toDate());
          }}
        />
      </div>
      <div className="pt-2">
        <span className="inline-block w-[50px]">End</span>
        <Input
          type="datetime-local"
          value={dayjs(end).format(DATE_FORMAT)}
          onChange={(e) => {
            onEndChange?.(dayjs(e.target.value, DATE_FORMAT).toDate());
          }}
        />
      </div>
      <div>
        <Button
          highlight
          disabled={!title || !start || !end}
          className="mt-2"
          onClick={async () => {
            if (title && start && end) {
              onSubmit?.({
                title,
                start: new Date(start),
                end: new Date(end),
              });
            }
          }}
        >
          Create task
        </Button>
      </div>
    </div>
  );
};

export const CreateTaskPopper = ({
  start,
  end,
  parentElem,
  onClose,
  onStartChange,
  onEndChange,
}: {
  start?: Date | number;
  end?: Date | number;
  parentElem?: HTMLElement;
  onClose?: () => void;
  onStartChange?: (date: Date) => void;
  onEndChange?: (date: Date) => void;
}) => {
  const parent = useMemo(() => {
    if (!parentElem) {
      return {
        getBoundingClientRect(): any {
          return {
            top: window.innerHeight * 0.3,
            left: window.innerWidth * 0.8,
            width: 0,
            height: 0,
          };
        },
      };
    }
    return parentElem;
  }, [parentElem]);
  const [container, setContainer] = useState<HTMLElement | null>();
  const popper = usePopper(parent, container, {
    strategy: 'absolute',
    placement: 'right',
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          mainAxis: true,
          altAxis: true,
          boundary: document.body,
          padding: 20,
          tether: false,
        },
      },
    ],
  });

  const [title, setTitle] = useState('');
  const [{}, createTask] = useMutation(CREATE_TASK);

  return createPortal(
    <div
      className="bg-white rounded drop-shadow py-8 px-8 pt-4"
      ref={setContainer}
      {...popper.attributes.popper}
      style={popper.styles.popper}
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <CreateTaskPaneForm
        title={title}
        onTitleChange={setTitle}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        start={start}
        end={end}
        onClose={onClose}
        onSubmit={(form) =>
          createTask({
            input: {
              title: form.title,
              startDate: form.start,
              endDate: form.end,
            },
          })
        }
      />
    </div>,
    document.body
  );
};
