import { signIn, useSession } from 'next-auth/react';
import { ReactElement } from 'react';

export const Authenticated = ({ children }: { children?: ReactElement }) => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div>
        <button onClick={() => signIn('google')}>Sign in</button>
      </div>
    );
  }

  return children ?? null;
};
