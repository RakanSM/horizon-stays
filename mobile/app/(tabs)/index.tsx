import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';

function KPICard({ label, value, color = '#c9a96e' }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardTab() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: bookings, refetch } = useQuery({
    queryKey: ['mobile_bookings'],
    queryFn: async () => { const { data } = await supabase.from('bookings').select('status, amount_sar, check_in'); return data ?? []; },
  });

  const today = new Date().toISOString().split('T')[0];
  const activeCount = (bookings ?? []).filter(b => ['confirmed', 'checked_in'].includes(b.status)).length;
  const todayRevenue = (bookings ?? []).filter(b => b.check_in === today).reduce((s, b) => s + b.amount_sar, 0);
  const pendingCount = (bookings ?? []).filter(b => b.status === 'pending').length;

  async function onRefresh() { setRefreshing(true); await refetch(); setRefreshing(false); }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c9a96e" />}>
      <Text style={styles.header}>لوحة التحكم</Text>
      <View style={styles.grid}>
        <KPICard label="الحجوزات النشطة" value={activeCount} />
        <KPICard label="إيرادات اليوم" value={`${todayRevenue.toLocaleString()} ر`} />
        <KPICard label="بانتظار الموافقة" value={pendingCount} color="#f87171" />
        <KPICard label="إجمالي الحجوزات" value={(bookings ?? []).length} color="#60a5fa" />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0a08', padding: 16 },
  header: { fontSize: 24, color: '#f5f0e8', fontWeight: 'bold', marginBottom: 16, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: '#141210', borderWidth: 1, borderColor: 'rgba(201,169,110,0.18)', borderRadius: 12, padding: 14, alignItems: 'flex-end' },
  kpiValue: { fontSize: 22, fontWeight: 'bold' },
  kpiLabel: { fontSize: 11, color: 'rgba(245,240,232,0.45)', marginTop: 4, textAlign: 'right' },
});
