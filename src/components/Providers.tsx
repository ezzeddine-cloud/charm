'use client';

import { StoreProvider } from '@/context/StoreContext';
import { ToastContainer } from '@/components/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <ToastContainer />
    </StoreProvider>
  );
}
