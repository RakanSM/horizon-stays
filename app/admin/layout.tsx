import { createServerClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/admin/AdminLayout';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: ReactNode }) {
  // Auth redirect is handled by middleware — no redirect here (avoids login loop).
  // Layout only decides whether to wrap in the admin shell.
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Unauthenticated: render children as-is (login page fills the screen itself)
    return <>{children}</>;
  }
  return <AdminLayout>{children}</AdminLayout>;
}
