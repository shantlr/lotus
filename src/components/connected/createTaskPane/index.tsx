import { graphql } from '@/gql/__generated/client';
import { useMemo, useState } from 'react';
import { FaRegCalendarPlus, FaRegClock, FaTimes } from 'react-icons/fa';
import { useMutation } from 'urql';
import { Button } from '../../base/button';
import { Input } from '../../base/input';
import { usePopper } from 'react-popper';
import { createPortal } from 'react-dom';
import { DateRangePicker } from '../../base/dateRangePicker';
import { SelectLabels } from '../selectTaskLabels';

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

export const CreateTaskPaneForm = ({
  start,
  title,
  end,
  labelIds,

  onClose,
  onTitleChange,
  onEndChange,
  onStartChange,
  onLabelsChange,
  onSubmit,
}: {
  title?: string;
  start?: Date | number;
  end?: Date | number;
  labelIds?: string[];
  onClose?: () => void;
  onTitleChange?: (title: string) => void;
  onStartChange?: (date: Date) => void;
  onEndChange?: (date: Date) => void;
  onLabelsChange?: (labelIds: string[]) => void;
  onSubmit?: (value: { title: string; start: Date; end: Date }) => void;
}) => {
  return (
    <div className="w-full max-w-[280px]">
      <div className="flex">
        <div className="w-[30px] min-h-[1px] shrink-0" />
        <Input
          className="w-full"
          value={title || ''}
          onChange={(e) =>
            onTitleChange?.((e.target as HTMLInputElement).value)
          }
          placeholder="Task title"
        />
        <Button
          round
          className="ml-2"
          onClick={() => {
            onClose?.();
          }}
        >
          <FaTimes />
        </Button>
      </div>

      <div className="flex items-start pt-2">
        <div className="w-[30px] pt-[4px] min-h-[1px] shrink-0 flex items-center">
          <FaRegClock />
        </div>
        <DateRangePicker
          start={start}
          end={end}
          onChange={(range) => {
            onStartChange?.(range.start);
            onEndChange?.(range.end);
          }}
        />
      </div>

      <div className="flex items-start pt-2">
        <div className="w-[30px] pt-[4px] min-h-[1px] shrink-0 flex items-center">
          <FaRegCalendarPlus />
        </div>
        <SelectLabels
          baseContainerClassName="flex items-center input-default w-full flex px-2 overflow-x-auto space-x-1"
          showContainerClassName="input-default-focus"
          labelClassName="text-xs my-1 px-2 bg-gray-400 rounded select-none border-2 text-white"
          value={labelIds}
          assignable
          onChange={onLabelsChange}
          onDefault={(v) => {
            if (v.length) {
              onLabelsChange?.(v.slice(0, 1).map((v) => v.id));
            }
          }}
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button
          t="highlight"
          disabled={!title || !start || !end || !labelIds?.length}
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
  onStartChange,
  onEndChange,

  parentElem,
  onClose,
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
      {
        name: 'offset',
        options: { offset: [0, 10] },
      },
      {
        name: 'computeStyles',
        options: {
          adaptive: false,
        },
      },
    ],
  });

  const [title, setTitle] = useState('');
  const [labelIds, setLabelIds] = useState<string[]>();
  const [{}, createTask] = useMutation(CREATE_TASK);

  return createPortal(
    <div
      className="bg-white rounded drop-shadow py-4 px-4 z-50 transition"
      ref={setContainer}
      {...popper.attributes.popper}
      style={popper.styles.popper}
    >
      <CreateTaskPaneForm
        title={title}
        onTitleChange={setTitle}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        start={start}
        end={end}
        onClose={onClose}
        labelIds={labelIds}
        onLabelsChange={setLabelIds}
        onSubmit={(form) =>
          createTask({
            input: {
              title: form.title,
              startDate: form.start,
              endDate: form.end,
              labelIds: labelIds as string[],
            },
          })
        }
      />
    </div>,
    document.body
  );
};
