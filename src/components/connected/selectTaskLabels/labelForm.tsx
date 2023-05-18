import { Button } from '@/components/base/button';
import { IconButton } from '@/components/base/iconButton';
import { Input } from '@/components/base/input';
import { graphql } from '@/gql/__generated/client';
import clsx from 'clsx';
import { random } from 'lodash';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useQuery } from 'urql';

const GET_LABEL_COLORS = graphql(`
  query GetLabelColors {
    labelColors {
      id
      main
      outline
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
    <div className={clsx('flex space-x-1', className)}>
      {data?.labelColors.map((c) => (
        <div
          key={c.id}
          className={clsx(
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

export const useLabelForm = (
  initial?: {
    name?: string | null | undefined;
    colorId?: string | null | undefined;
  } | null
) => {
  const [name, onNameChange] = useState(() => initial?.name ?? '');
  const [colorId, onColorIdChange] = useState<string | undefined>(
    () => initial?.colorId ?? undefined
  );

  useEffect(() => {
    if (initial?.name) {
      onNameChange(initial.name);
    }
    if (initial?.colorId) {
      onColorIdChange(initial.colorId);
    }
  }, [initial?.name, initial?.colorId]);

  return {
    name,
    onNameChange,
    colorId,
    onColorIdChange,
  };
};

export const LabelForm = ({
  name,
  onNameChange,
  colorId,
  onColorIdChange,

  submitting,
  onSubmit,

  onCancel,
}: {
  onCancel?: () => void;
} & { submitting?: boolean; onSubmit?: () => void } & ReturnType<
    typeof useLabelForm
  >) => {
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
            onNameChange?.(e.target.value);
          }}
        />
      </div>
      <ColorPicker
        className="mt-2"
        autoPick
        value={colorId}
        onChange={onColorIdChange}
      />
      <div className="mt-2 flex justify-end">
        <Button
          disabled={!colorId || !name}
          t="highlight"
          loading={submitting}
          onClick={() => onSubmit?.()}
        >
          Ok
        </Button>
      </div>
    </div>
  );
};
