import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

const STATUS_COLORS: Record<string, string> = { pending: '#eab308', confirmed: '#4ade80', checked_in: '#60a5fa', cancelled: '#f87171', checked_out: 'rgba(245,240,232,0.45)' };

export default function BookingsTab() {
  const qc = useQueryClient();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['mobile_bookings_list'],
    queryFn: async () => { const { data } = await supabase.from('bookings').select('*, property:properties(internal_name)').order('created_at', { ascending: false }).limit(50); return data ?? []; },
  });

  async function handleApprove(id: string) {
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['mobile_bookings_list'] });
  }
  async function handleReject(id: string) {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['mobile_bookings_list'] });
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0c0a08' }}>
      <FlatList
        data={bookings ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
            onLongPress={() => {
              if (item.status === 'pending') {
                Alert.alert('إجراء', item.guest_name, [
                  { text: 'قبول', onPress: () => handleApprove(item.id) },
                  { text: 'رفض', style: 'destructive', onPress: () => handleReject(item.id) },
                  { text: 'إلغاء', style: 'cancel' },
                ]);
              }
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={[styles.status, { color: STATUS_COLORS[item.status] ?? '#c9a96e' }]}>● {item.status}</Text>
              <Text style={styles.amount}>{item.amount_sar?.toLocaleString()} ريال</Text>
            </View>
            <Text style={styles.name}>{item.guest_name}</Text>
            <Text style={styles.meta}>{item.check_in} → {item.check_out} · {(item as any).property?.internal_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#141210', borderWidth: 1, borderColor: 'rgba(201,169,110,0.18)', borderRadius: 10, padding: 12, marginBottom: 8 },
  name: { color: '#f5f0e8', fontWeight: '600', fontSize: 15, textAlign: 'right' },
  meta: { color: 'rgba(245,240,232,0.45)', fontSize: 12, marginTop: 2, textAlign: 'right' },
  status: { fontSize: 11, fontWeight: '600' },
  amount: { color: '#c9a96e', fontWeight: 'bold', fontSize: 14 },
});
