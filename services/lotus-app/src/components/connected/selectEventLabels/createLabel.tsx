import { graphql } from '@/gql/__generated/client';
import { CreateLabelMutation } from '@/gql/__generated/client/graphql';
import { useMutation } from 'urql';
import { LabelForm, useLabelForm } from './labelForm';

const CREATE_LABEL_MUTATION = graphql(`
  mutation CreateLabel($input: CreateLabelInput!) {
    createLabel(input: $input) {
      id
      name
      color
      secondaryColor
    }
  }
`);

export const CreateLabel = ({
  onCancel,
  onCreated,
}: {
  onCreated?: (createdLabel: CreateLabelMutation['createLabel']) => void;
  onCancel?: () => void;
}) => {
  const form = useLabelForm();

  const [{ fetching }, createLabel] = useMutation(CREATE_LABEL_MUTATION);

  return (
    <LabelForm
      {...form}
      onCancel={onCancel}
      submitting={fetching}
      onSubmit={async () => {
        const res = await createLabel({
          input: {
            name: form.name,
            color: form.colorId as string,
          },
        });
        if (res.data?.createLabel) {
          form.onNameChange('');
          form.onColorIdChange(undefined);
          onCreated?.(res.data.createLabel);
        }
      }}
    />
  );
};
