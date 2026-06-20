import { Sidebar } from './Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { ReactNode } from 'react';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-hs-bg overflow-hidden" dir="rtl">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ToastProvider>
  );
}
