import { Button } from '@/components/base/button';
import { LayoutWithTopBar } from '@/layout/withTopBar';
import { signIn, useSession } from 'next-auth/react';

export default function HomePage() {
  const { status } = useSession();

  return (
    <LayoutWithTopBar
      topBar={
        <div className="h-full w-full flex items-center justify-end px-4">
          {status === 'authenticated' && <Button>Open App</Button>}
          {status === 'unauthenticated' && (
            <Button
              onClick={() => {
                signIn('google');
              }}
            >
              Sign in
            </Button>
          )}
        </div>
      }
    >
      <div className="w-full h-[200px] flex justify-center items-center">
        Welcome to Lotus
      </div>
    </LayoutWithTopBar>
  );
}
