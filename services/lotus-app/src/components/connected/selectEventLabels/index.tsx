import { ActionItem } from '@/components/base/button';
import { Checkbox } from '@/components/base/checkbox';
import { IconButton } from '@/components/base/iconButton';
import { Popper, PopperBody } from '@/components/base/popper';
import { Slider } from '@/components/base/slider';
import { graphql } from '@/gql/__generated/client';
import { GetLabelsQuery } from '@/gql/__generated/client/graphql';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { FaPen, FaPlusCircle } from 'react-icons/fa';
import { useQuery } from 'urql';
import { CreateLabel } from './createLabel';
import { SIZES, Size } from '@/components/base/styles';
import { Spinner } from '@/components/base/spinner';
import { EditLabel } from './editLabel';

export const GET_LABELS_QUERY = graphql(`
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
  placeholder = 'Select labels',
  loading,
  size = 'md',

  className,
  showContainerClassName = '',
  baseContainerClassName = 'input-default flex items-center space-x-1 px-2 border-transparent hover:shadow rounded cursor-pointer transition max-overflow',
  assignable,

  labelClassName = 'border rounded px-2 text-xs bg-gray-800 select-none text-white',
}: {
  value?: string[] | null;
  size?: Size;
  placeholder?: string;
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
    query: GET_LABELS_QUERY,
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

  const [state, setState] = useState<'list' | 'add' | 'edit'>('list');
  const [labelToEdit, setLabelToEdit] = useState<string>();

  useEffect(() => {
    if (!show) {
      setState('list');
    }
  }, [show]);

  return (
    <Popper
      show={show}
      options={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 5],
            },
          },
        ],
      }}
      onClose={setShow}
      popper={
        <PopperBody className="bg-white p-2">
          <Slider width={240} value={state}>
            <div className="flex" key="list">
              <div className="grow space-y-2">
                {data?.labels?.map((label) => (
                  <ActionItem
                    t="white-ghost"
                    className={clsx(
                      'flex text-white hover:opacity-100 border-2 grow items-center text-sm px-2 rounded transition',
                      {
                        'opacity-30': !value?.includes(label.id),
                      }
                    )}
                    style={{
                      background: label.color || undefined,
                      borderColor: label.secondaryColor || undefined,
                    }}
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
                    <span className="grow select-none">{label.name}</span>
                    <IconButton
                      icon={FaPen}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLabelToEdit(label.id);
                        setState('edit');
                      }}
                    />
                  </ActionItem>
                ))}
              </div>
              <div className="h-[20px] ml-2 flex items-center justify-end ">
                <IconButton
                  icon={FaPlusCircle}
                  onClick={() => {
                    setState('add');
                  }}
                />
              </div>
            </div>
            {labelToEdit && (
              <EditLabel
                key="edit"
                labelId={labelToEdit}
                onCancel={() => {
                  setState('list');
                  setLabelToEdit(undefined);
                }}
                onDone={() => {
                  setState('list');
                }}
              />
            )}
            <CreateLabel
              key="add"
              onCancel={() => {
                setState('list');
              }}
              onCreated={(label) => {
                onChange?.([...(value || []), label.id]);
                setState('list');
              }}
            />
          </Slider>
        </PopperBody>
      }
    >
      <div
        className={clsx(baseContainerClassName, className, SIZES[size], {
          [showContainerClassName]: show,
        })}
        onClick={() => !loading && setShow(!show)}
      >
        {fetching && <Spinner />}
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
          <span className="text-xs2 text-gray-400 select-none">
            {placeholder}
          </span>
        )}
      </div>
    </Popper>
  );
};
