'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { BlockedDay } from '@/types';

export function useBlockedDays(propertyId?: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['blocked_days', propertyId],
    queryFn: async (): Promise<BlockedDay[]> => {
      let query = supabase
        .from('blocked_days')
        .select('*')
        .order('start_date', { ascending: true });
      if (propertyId) query = query.eq('property_id', propertyId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
