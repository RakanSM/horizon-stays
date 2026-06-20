'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextValue { toast: (type: ToastType, message: string) => void; }

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const typeClasses: Record<ToastType, string> = {
  success: 'border-hs-green/40 bg-hs-green/10 text-hs-green',
  error: 'border-hs-red/40 bg-hs-red/10 text-hs-red',
  info: 'border-hs-blue/40 bg-hs-blue/10 text-hs-blue',
  warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 min-w-[300px]">
        {toasts.map(t => (
          <div key={t.id} className={cn('flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-fade-in', typeClasses[t.type])}>
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto opacity-60 hover:opacity-100 text-xs">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
