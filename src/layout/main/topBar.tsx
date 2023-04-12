import { ActionItem } from '@/components/base/button';
import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ComponentProps } from 'react';
import { FaCalendar, FaListUl } from 'react-icons/fa';

const MenuItem = ({
  className,
  href,
  ...props
}: { href: string } & ComponentProps<typeof ActionItem>) => {
  const router = useRouter();
  return (
    <ActionItem
      noBg={!router.pathname.startsWith(href)}
      className={classNames('px-4 py-2 rounded', className)}
      {...props}
    ></ActionItem>
  );
};

const UserItem = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <ActionItem className="rounded-full w-[32px] h-[32px] flex items-center justify-center">
      {session.user?.name?.[0]}
    </ActionItem>
  );
};

export const MainLayoutTopBar = () => {
  return (
    <div className="w-full flex h-[48px] items-center border-b border-gray-800">
      <div className="w-[250px]"></div>
      <div className="flex grow-1 space-x-2 w-full">
        <MenuItem href="/planning">
          <FaListUl />
        </MenuItem>

        <MenuItem href="/calendar">
          <FaCalendar />
        </MenuItem>
      </div>
      <div className="pr-4">
        <UserItem />
      </div>
    </div>
  );
};
