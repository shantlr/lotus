import { ActionItem } from '@/components/base/button';
import { Checkbox } from '@/components/base/checkbox';
import { IconButton } from '@/components/base/iconButton';
import { Popper, PopperBody } from '@/components/base/popper';
import { graphql } from '@/gql/__generated/client';
import classNames from 'classnames';
import { useState } from 'react';
import { FaPlus, FaPlusCircle } from 'react-icons/fa';
import { useQuery } from 'urql';

const QUERY = graphql(`
  query TaskLabels {
    taskLabels {
      id
      name
      color
    }
  }
`);

export const LabelSelector = ({ className }: { className?: string }) => {
  const [{ data, fetching }] = useQuery({ query: QUERY });

  const [show, setShow] = useState(false);

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
            {data?.taskLabels?.map((label) => (
              <ActionItem
                t="white-ghost"
                className="flex items-center text-sm px-2 rounded transition"
                key={label.id}
              >
                <Checkbox className="mr-2 pointer-events-none" checked />
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
        className={classNames(
          className,
          'h-full flex justify-center items-center px-2 border border-transparent border-dashed hover:border-gray-400 rounded cursor-pointer transition',
          'max-overflow max-w-[200px]'
        )}
        onClick={() => setShow(!show)}
      >
        {data?.taskLabels?.map((label) => (
          <div
            style={{ backgroundColor: label.color || undefined }}
            className="rounded px-2 text-xs bg-gray-800 select-none"
            key={label.id}
          >
            {label.name}
          </div>
        ))}
      </div>
    </Popper>
  );
};
