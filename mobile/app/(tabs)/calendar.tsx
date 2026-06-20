import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';

export default function CalendarTab() {
  const [month, setMonth] = useState(new Date());
  const { data: bookings } = useQuery({
    queryKey: ['mobile_cal_bookings', month.toISOString().slice(0, 7)],
    queryFn: async () => { const { data } = await supabase.from('bookings').select('check_in, check_out, guest_name, platform, amount_sar').not('status', 'in', '("cancelled")'); return data ?? []; },
  });

  const today = new Date().toISOString().split('T')[0];
  const days = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => {
    const d = new Date(month.getFullYear(), month.getMonth(), i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const dayBookings = (bookings ?? []).filter(b => b.check_in <= dateStr && b.check_out > dateStr);
    return { date: dateStr, day: i + 1, bookings: dayBookings, isToday: dateStr === today };
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0c0a08', padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() - 1); return n; })}>
          <Text style={{ color: '#c9a96e', fontSize: 20 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#f5f0e8', fontWeight: 'bold', fontSize: 16 }}>{month.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}</Text>
        <TouchableOpacity onPress={() => setMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() + 1); return n; })}>
          <Text style={{ color: '#c9a96e', fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      </View>
      {days.map(d => (
        <View key={d.date} style={[styles.dayRow, d.isToday && { borderColor: '#c9a96e' }]}>
          <Text style={[styles.dayNum, d.isToday && { color: '#c9a96e' }]}>{d.day}</Text>
          <View style={{ flex: 1 }}>
            {d.bookings.slice(0, 2).map((b, i) => (
              <Text key={i} style={styles.bookingChip}>{b.guest_name.split(' ')[0]} · {b.platform}</Text>
            ))}
            {d.bookings.length > 2 && <Text style={{ color: 'rgba(245,240,232,0.45)', fontSize: 10 }}>+{d.bookings.length - 2}</Text>}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  dayRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderColor: 'rgba(201,169,110,0.1)', borderRadius: 6, padding: 6, marginBottom: 4, backgroundColor: '#141210' },
  dayNum: { color: 'rgba(245,240,232,0.45)', width: 24, fontSize: 12, textAlign: 'center' },
  bookingChip: { color: '#c9a96e', fontSize: 10, backgroundColor: 'rgba(201,169,110,0.1)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginBottom: 2 },
});
