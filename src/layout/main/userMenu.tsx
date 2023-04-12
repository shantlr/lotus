import { ActionItem } from '@/components/base/button';
import { signOut } from 'next-auth/react';

export const UserMenu = () => {
  return (
    <div className="w-[120px]">
      <ActionItem
        noBg
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
