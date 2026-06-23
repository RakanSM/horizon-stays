import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  // Redirect to /admin-login (outside /admin segment — no redirect loop possible)
  if (!session) redirect('/admin-login');
  return <AdminLayout>{children}</AdminLayout>;
}
