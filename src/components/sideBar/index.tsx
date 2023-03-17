import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HTMLProps } from 'react';

const BaseItem = ({
  className,
  active,
  ...props
}: { active?: boolean } & HTMLProps<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        `w-full hover:bg-gray-300 py-1 px-4 rounded-md cursor-pointer transition ${className}`,
        {
          'bg-gray-700': active,
        }
      )}
      {...props}
    />
  );
};

const UserItem = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return <BaseItem className="mb-8">{session.user?.name}</BaseItem>;
};

export const SideBar = () => {
  const router = useRouter();

  return (
    <div className="w-[150px] h-full py-8 px-2 space-y-2">
      <UserItem />
      <Link href="/calendar">
        <BaseItem active={router.pathname.startsWith('/calendar')}>
          Planning
        </BaseItem>
      </Link>
    </div>
  );
};
