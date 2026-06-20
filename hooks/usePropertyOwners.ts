'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { PropertyOwner } from '@/types';

export function usePropertyOwners() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['property_owners'],
    queryFn: async (): Promise<PropertyOwner[]> => {
      const { data, error } = await supabase
        .from('property_owners')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
