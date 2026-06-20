'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Booking, BookingStatus, Platform } from '@/types';

interface BookingFilters {
  status?: BookingStatus;
  platform?: Platform;
  propertyId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useBookings(filters?: BookingFilters) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async (): Promise<Booking[]> => {
      let query = supabase
        .from('bookings')
        .select('*, property:properties(internal_name, type)')
        .order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.platform) query = query.eq('platform', filters.platform);
      if (filters?.propertyId) query = query.eq('property_id', filters.propertyId);
      if (filters?.dateFrom) query = query.gte('check_in', filters.dateFrom);
      if (filters?.dateTo) query = query.lte('check_out', filters.dateTo);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
