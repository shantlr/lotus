import { ActionItem } from '@/components/base/button';
import { signOut, useSession } from 'next-auth/react';

export const UserMenu = () => {
  const { data: session } = useSession();
  return (
    <div className="w-[160px]">
      <div className="mb-2">{session?.user?.name}</div>
      <ActionItem
        // t="ghost"
        className="px-4 py rounded"
        onClick={() => {
          signOut();
        }}
      >
        Logout
      </ActionItem>
    </div>
  );
};
