import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: ReactNode }) {
  const pathname = headers().get('x-pathname') ?? '';
  // Allow login page through without auth check
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/admin/login');
  return <AdminLayout>{children}</AdminLayout>;
}
