import { ActionItem, ButtonLink } from '@/components/base/button';
import { signOut, useSession } from 'next-auth/react';

export const UserMenu = () => {
  const { data: session } = useSession();
  return (
    <div className="w-[160px] overflow-hidden">
      <div className="pl-2">
        <div className="">{session?.user?.name}</div>
        <div className="text-xs text-gray-400 text-ellipsis overflow-hidden">
          {session?.user?.email}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <ButtonLink
          href="/settings"
          className="px-4"
          style={{ justifyContent: 'start' }}
        >
          Settings
        </ButtonLink>
        <ActionItem
          className="px-4 py rounded select-none"
          onClick={() => {
            signOut({
              callbackUrl: '/',
            });
          }}
        >
          Logout
        </ActionItem>
      </div>
    </div>
  );
};
