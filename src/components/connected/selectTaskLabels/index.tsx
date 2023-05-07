import { ActionItem } from '@/components/base/button';
import { Checkbox } from '@/components/base/checkbox';
import { IconButton } from '@/components/base/iconButton';
import { Popper, PopperBody } from '@/components/base/popper';
import { graphql } from '@/gql/__generated/client';
import { GetLabelsQuery } from '@/gql/__generated/client/graphql';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import { useQuery } from 'urql';

export const TASK_LABELS_QUERY = graphql(`
  query GetLabels($input: GetLabelsInput) {
    labels(input: $input) {
      id
      name
      color
      secondaryColor
    }
  }
`);

export const SelectLabels = ({
  value,
  onChange,
  onDefault,
  loading,

  className,
  showContainerClassName = '',
  baseContainerClassName = 'h-full flex items-center px-2 border border-transparent border-dashed hover:border-gray-400 rounded cursor-pointer transition max-overflow',
  assignable,

  labelClassName = 'border rounded px-2 text-xs bg-gray-800 select-none text-white',
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
  onDefault?: (labels: GetLabelsQuery['labels']) => void;
  loading?: boolean;
  className?: string;
  baseContainerClassName?: string;
  showContainerClassName?: string;
  assignable?: boolean;

  labelClassName?: string;
}) => {
  const [{ data, fetching }] = useQuery({
    query: TASK_LABELS_QUERY,
    variables: {
      input: {
        assignable,
      },
    },
  });

  const [show, setShow] = useState(false);

  const selected = useMemo(() => {
    return data?.labels?.filter((l) => value?.includes(l.id)) || [];
  }, [data?.labels, value]);

  useEffect(() => {
    if (!value && data?.labels) {
      onDefault?.(data.labels);
    }
  }, [data?.labels, onDefault, value]);

  return (
    <Popper
      show={show}
      options={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ],
      }}
      onClose={setShow}
      popper={
        <PopperBody className="bg-white p-2">
          <div className="flex">
            {data?.labels?.map((label) => (
              <ActionItem
                t="white-ghost"
                className="flex items-center text-sm px-2 rounded transition"
                key={label.id}
                onClick={() => {
                  if (!onChange) {
                    return;
                  }

                  if (!value?.includes(label.id)) {
                    onChange([...(value || []), label.id]);
                  } else {
                    onChange(value.filter((v) => v !== label.id));
                  }
                }}
              >
                <Checkbox
                  className="mr-2 pointer-events-none"
                  checked={value?.includes(label.id) ?? false}
                  onChange={() => {}}
                />
                <span className="select-none">{label.name}</span>
              </ActionItem>
            ))}
            <div className="h-[20px] ml-2 flex items-center justify-end float-right">
              <IconButton icon={FaPlusCircle} />
            </div>
          </div>
        </PopperBody>
      }
    >
      <div
        className={classNames(baseContainerClassName, className, {
          [showContainerClassName]: show,
        })}
        onClick={() => !loading && setShow(!show)}
      >
        {selected.map((label) => (
          <div
            style={{
              backgroundColor: label.color || undefined,
              borderColor: label.secondaryColor || undefined,
            }}
            className={labelClassName}
            key={label.id}
          >
            {label.name}
          </div>
        ))}
        {!selected.length && (
          <span className="text-xs text-gray-400">Select labels</span>
        )}
      </div>
    </Popper>
  );
};
