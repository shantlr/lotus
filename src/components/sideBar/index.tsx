import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { HTMLProps } from 'react';

const BaseItem = ({ className, ...props }: HTMLProps<HTMLDivElement>) => {
  return (
    <div
      className={`w-full hover:bg-gray-300 py-1 px-4 rounded-md cursor-pointer transition ${className}`}
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
  return (
    <div className="w-[150px] h-full py-8 px-2 space-y-2">
      <UserItem />
      <Link href="/calendar">
        <BaseItem>Planning</BaseItem>
      </Link>
    </div>
  );
};
