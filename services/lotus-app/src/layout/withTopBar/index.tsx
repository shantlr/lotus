import Head from 'next/head';
import { ReactNode } from 'react';
import { LayoutBase } from '../base';

export const LayoutWithTopBar = ({
  topBar,
  children,
}: {
  topBar?: ReactNode;
  children?: ReactNode;
}) => {
  return (
    <LayoutBase>
      <div className="shrink-0 w-full flex h-[48px] items-center border-b border-gray-800">
        {topBar}
      </div>
      {children}
    </LayoutBase>
  );
};
