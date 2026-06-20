'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Claim, ClaimStatus } from '@/types';

export function useClaims(status?: ClaimStatus) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['claims', status],
    queryFn: async (): Promise<Claim[]> => {
      let query = supabase
        .from('claims')
        .select('*, booking:bookings(guest_name, guest_phone), property:properties(internal_name)')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
