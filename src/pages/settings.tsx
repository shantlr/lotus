import { ActionItem, Button } from '@/components/base/button';
import { graphql } from '@/gql/__generated/client';
import { MainLayout } from '@/layout/main';
import { signIn } from 'next-auth/react';
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

export default function SettingsPage() {
  const [{ data }] = useQuery({ query: QUERY });

  return (
    <MainLayout>
      <div className="p-2">
        <div className="font-bold">Accounts</div>
        <div className="flex flex-col items-start space-y-2 py-2 mb-4">
          {data?.me?.accounts?.map((acc) => (
            <ActionItem className="rounded px-2" key={acc.id}>
              {acc.provider} {acc.email}
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
        {/*  */}
      </div>
    </MainLayout>
  );
}
