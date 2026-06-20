'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { CleaningTask } from '@/types';

export function useCleaningTasks(propertyId?: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['cleaning_tasks', propertyId],
    queryFn: async (): Promise<CleaningTask[]> => {
      let query = supabase
        .from('cleaning_tasks')
        .select('*')
        .order('scheduled_at', { ascending: true });
      if (propertyId) query = query.eq('property_id', propertyId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
