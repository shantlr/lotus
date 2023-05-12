import { Button } from '@/components/base/button';
import { IconButton } from '@/components/base/iconButton';
import { Input } from '@/components/base/input';
import { graphql } from '@/gql/__generated/client';
import { CreateLabelMutation } from '@/gql/__generated/client/graphql';
import classNames from 'classnames';
import { random } from 'lodash';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useMutation, useQuery } from 'urql';

const GET_LABEL_COLORS = graphql(`
  query GetLabelColors {
    labelColors {
      id
      main
      outline
    }
  }
`);

const CREATE_LABEL = graphql(`
  mutation CreateLabel($input: CreateLabelInput!) {
    createLabel(input: $input) {
      id
      name
      color
      secondaryColor
    }
  }
`);

const ColorPicker = ({
  className,
  value,
  onChange,
  autoPick,
}: {
  className?: string;
  value?: string;
  onChange?: (id: string) => void;
  autoPick?: boolean;
}) => {
  const [{ data }] = useQuery({
    query: GET_LABEL_COLORS,
  });

  useEffect(() => {
    if (autoPick && data?.labelColors && !value) {
      const idx = random(0, data.labelColors.length - 1);
      onChange?.(data.labelColors[idx].id);
    }
  }, [autoPick, data?.labelColors, onChange, value]);

  return (
    <div className={classNames('flex space-x-1', className)}>
      {data?.labelColors.map((c) => (
        <div
          key={c.id}
          className={classNames(
            'w-[15px] h-[15px] rounded cursor-pointer border-2 hover:opacity-100',
            {
              'opacity-30': c.id !== value,
            }
          )}
          onClick={() => onChange?.(c.id)}
          style={{
            background: c.main,
            borderColor: c.outline,
          }}
        ></div>
      ))}
    </div>
  );
};

export const CreateLabel = ({
  onCancel,
  onCreated,
}: {
  onCreated?: (createdLabel: CreateLabelMutation['createLabel']) => void;
  onCancel?: () => void;
}) => {
  const [name, setName] = useState('');
  const [colorId, setColorId] = useState<string>();

  const [{ fetching }, createLabel] = useMutation(CREATE_LABEL);

  return (
    <div className="">
      <div className="flex items-center">
        {onCancel && (
          <IconButton
            className="mr-2"
            icon={FaArrowLeft}
            onClick={() => {
              onCancel?.();
            }}
          />
        )}
        <Input
          className="grow"
          placeholder="Label name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
      <ColorPicker
        className="mt-2"
        autoPick
        value={colorId}
        onChange={setColorId}
      />
      <div className="mt-2 flex justify-end">
        <Button
          disabled={!colorId || !name}
          t="highlight"
          loading={fetching}
          onClick={async () => {
            const res = await createLabel({
              input: {
                name,
                color: colorId as string,
              },
            });
            if (res.data?.createLabel) {
              setName('');
              setColorId(undefined);
              onCreated?.(res.data.createLabel);
            }
          }}
        >
          Ok
        </Button>
      </div>
    </div>
  );
};
