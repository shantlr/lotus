import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HTMLProps, ReactNode } from 'react';
import { FaCalendar } from 'react-icons/fa';

const BaseItem = ({
  className,
  active,
  ...props
}: { active?: boolean } & HTMLProps<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        `flex items-center justify-start w-full hover:bg-gray-400 hover:shadow py-2 px-4 rounded-md cursor-pointer transition ${className}`,
        {
          'bg-gray-700': active,
        }
      )}
      {...props}
    />
  );
};

const MenuItem = ({
  icon,
  href,
  children,
}: {
  icon: ReactNode;
  href: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  return (
    <div>
      <Link href={href}>
        <BaseItem active={router.pathname.startsWith(href)}>
          <span className="mr-2">{icon}</span>
          {children}
        </BaseItem>
      </Link>
    </div>
  );
};

const UserItem = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return <BaseItem>{session.user?.name}</BaseItem>;
};

export const SideBar = () => {
  return (
    <div className="w-[260px] h-full py-8 px-4 divide-y divide-gray-500 bg-slate-800">
      <div className="pb-4">
        <UserItem />
      </div>

      <div className="pt-4 space-y-4">
        <MenuItem href="/planning" icon={<FaCalendar />}>
          Planning
        </MenuItem>

        <MenuItem href="/calendar" icon={<FaCalendar />}>
          Calendar
        </MenuItem>
      </div>
    </div>
  );
};
