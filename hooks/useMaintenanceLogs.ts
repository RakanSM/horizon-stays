'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { MaintenanceLog, Severity } from '@/types';

export function useMaintenanceLogs(propertyId?: string, severity?: Severity) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['maintenance_logs', propertyId, severity],
    queryFn: async (): Promise<MaintenanceLog[]> => {
      let query = supabase
        .from('maintenance_logs')
        .select('*, property:properties(internal_name)')
        .order('created_at', { ascending: false });
      if (propertyId) query = query.eq('property_id', propertyId);
      if (severity) query = query.eq('severity', severity);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
