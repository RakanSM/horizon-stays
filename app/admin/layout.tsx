import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/admin/login');
  return <AdminLayout>{children}</AdminLayout>;
}
