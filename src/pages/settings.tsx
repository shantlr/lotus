import { ActionItem, Button } from '@/components/base/button';
import { graphql } from '@/gql/__generated/client';
import { MainLayout } from '@/layout/main';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { useQuery } from 'urql';

const QUERY = graphql(`
  query GetUserAccounts {
    me {
      accounts {
        id
        provider
        email
      }
    }
  }
`);

const ProviderIcon = ({
  className,
  provider,
}: {
  className?: string;
  provider?: string;
}) => {
  switch (provider) {
    case 'google': {
      return <FaGoogle className={className} />;
    }
    case 'azuread': {
      return <FaMicrosoft className={className} />;
    }
    default:
  }
  return <span className={className}>{provider}</span>;
};

export default function SettingsPage() {
  const [{ data }] = useQuery({ query: QUERY });

  return (
    <MainLayout>
      <div className="p-2">
        <div className="font-bold">Accounts</div>
        <div className="flex flex-col items-start space-y-2 py-2 mb-4">
          {data?.me?.accounts?.map((acc) => (
            <ActionItem className="flex items-center rounded px-2" key={acc.id}>
              <ProviderIcon
                className="mr-2"
                provider={acc.provider as string}
              />
              {acc.email}
            </ActionItem>
          ))}
        </div>
        <Button
          onClick={() => {
            signIn('azure-ad');
          }}
        >
          Add outlook account
        </Button>
      </div>
    </MainLayout>
  );
}
