import { Spinner } from '@/components/base/spinner';
import { LayoutBase } from '@/layout/base';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';

export const Authenticated = ({ children }: { children?: ReactElement }) => {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (!session) {
      router.replace({
        pathname: `/`,
        query: {
          si_r: router.route,
        },
      });
    }
  }, [router, session, status]);

  if (!session || !children) {
    return (
      <LayoutBase>
        <div className="w-full h-full flex justify-center items-center">
          <Spinner />
        </div>
      </LayoutBase>
    );
  }

  return children ?? null;
};
