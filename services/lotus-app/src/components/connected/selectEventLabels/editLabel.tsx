import { graphql } from '@/gql/__generated/client';
import { useMutation, useQuery } from 'urql';
import { LabelForm, useLabelForm } from './labelForm';
import { useMemo } from 'react';

const GET_LABEL_QUERY = graphql(`
  query GetLabel($id: ID!) {
    label(id: $id) {
      id
      name
      color
      secondaryColor
    }
    labelColors {
      id
      main
      outline
    }
  }
`);

const UPDATE_LABEL_MUTATION = graphql(`
  mutation UpdateLabel($input: UpdateLabelInput!) {
    updatLabel(input: $input) {
      id
      name
      color
      secondaryColor
    }
  }
`);

export const EditLabel = ({
  labelId,
  onCancel,
  onDone,
}: {
  labelId: string;
  onCancel?: () => void;
  onDone?: () => void;
}) => {
  const [{ data }] = useQuery({
    query: GET_LABEL_QUERY,
    variables: {
      id: labelId,
    },
  });

  const initialData = useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      name: data.label?.name,
      colorId: data.labelColors.find(
        (c) =>
          c.main === data.label?.color &&
          c.outline === data.label?.secondaryColor
      )?.id,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.label?.color, data?.labelColors]);

  const form = useLabelForm(initialData);

  const [{ fetching }, updateLabel] = useMutation(UPDATE_LABEL_MUTATION);

  return (
    <LabelForm
      key={data?.label?.id}
      {...form}
      onCancel={onCancel}
      submitting={fetching}
      onSubmit={async () => {
        await updateLabel({
          input: {
            id: labelId,
            name: form.name,
            color: form.colorId,
          },
        });
        onDone?.();
      }}
    />
  );
};
