'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Property } from '@/types';

export function useProperties() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['properties'],
    queryFn: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, owner:property_owners(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProperty(id: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['properties', id],
    queryFn: async (): Promise<Property | null> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, owner:property_owners(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
