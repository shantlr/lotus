import { ReactElement } from 'react';

export const Themed = ({ children }: { children: ReactElement }) => {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-900 text-white">
      {children}
    </div>
  );
};
