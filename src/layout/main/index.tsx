import Head from 'next/head';
import { ReactNode } from 'react';
import { MainLayoutTopBar } from './topBar';
import { LayoutWithTopBar } from '../withTopBar';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <LayoutWithTopBar topBar={<MainLayoutTopBar />}>
      {children}
    </LayoutWithTopBar>
  );
};
