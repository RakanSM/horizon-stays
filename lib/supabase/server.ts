import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const createServerClient = () =>
  createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// Alias for backwards compatibility
export const createClient = createServerClient;
