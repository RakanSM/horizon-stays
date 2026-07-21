import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!configured) {
    return NextResponse.json(
      { status: 'error', service: 'supabase', connected: false, reason: 'not_configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = createServerClient();
    const { count, error } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase health check failed:', error.code || 'query_error');
      return NextResponse.json(
        { status: 'error', service: 'supabase', connected: false, reason: 'query_failed' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      service: 'supabase',
      connected: true,
      readable: true,
      resource: 'properties',
      count: count ?? 0,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supabase health check exception:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json(
      { status: 'error', service: 'supabase', connected: false, reason: 'connection_failed' },
      { status: 503 }
    );
  }
}
