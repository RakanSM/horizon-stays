'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { DashboardKPIs } from '@/types';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface BookingRow { id: string; status: string; amount_sar: number; check_in: string; check_out: string; nights: number; }
interface OwnerRow { balance_due: number; }

export function useDashboardKPIs() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['dashboard_kpis'],
    queryFn: async (): Promise<DashboardKPIs> => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
      const today = format(now, 'yyyy-MM-dd');

      const [bookingsRes, expensesRes, cleaningRes, maintenanceRes, ownersRes] = await Promise.all([
        supabase.from('bookings').select('id, status, amount_sar, check_in, check_out, nights'),
        supabase.from('expenses').select('amount_sar'),
        supabase.from('cleaning_tasks').select('id, status').eq('status', 'pending'),
        supabase.from('maintenance_logs').select('id, severity').eq('status', 'open').in('severity', ['critical', 'high']),
        supabase.from('property_owners').select('balance_due'),
      ]);

      const bookings = (bookingsRes.data ?? []) as unknown as BookingRow[];
      const active = bookings.filter(b => ['confirmed', 'checked_in'].includes(b.status));
      const monthBookings = bookings.filter(b => b.check_in >= monthStart && b.check_in <= monthEnd);
      const todayBookings = bookings.filter(b => b.check_in === today);
      const pending = bookings.filter(b => b.status === 'pending');

      const monthRevenue = monthBookings.reduce((s, b) => s + (b.amount_sar ?? 0), 0);
      const todayRevenue = todayBookings.reduce((s, b) => s + (b.amount_sar ?? 0), 0);
      const totalBookedNights = monthBookings.reduce((s, b) => s + (b.nights ?? 0), 0);
      const totalAvailableNights = 30 * 3; // 3 sample properties × 30 days
      const occupancyRate = totalAvailableNights > 0 ? (totalBookedNights / totalAvailableNights) * 100 : 0;
      const revpar = totalAvailableNights > 0 ? monthRevenue / totalAvailableNights : 0;
      const adr = totalBookedNights > 0 ? monthRevenue / totalBookedNights : 0;
      const totalOwnerDues = ((ownersRes.data ?? []) as unknown as OwnerRow[]).reduce((s, o) => s + (o.balance_due ?? 0), 0);

      return {
        activeBookings: active.length,
        occupancyRate: Math.round(occupancyRate),
        todayRevenue,
        monthRevenue,
        pendingApprovals: pending.length,
        unbookedDaysThisMonth: totalAvailableNights - totalBookedNights,
        cleaningTasksPending: (cleaningRes.data ?? []).length,
        maintenanceAlerts: (maintenanceRes.data ?? []).length,
        revpar: Math.round(revpar),
        adr: Math.round(adr),
        avgRevenuePerProperty: monthRevenue / 3,
        totalOutstandingOwnerDues: totalOwnerDues,
      };
    },
    refetchInterval: 60000, // refresh every minute
  });
}
