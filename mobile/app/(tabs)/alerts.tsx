import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AlertItem { id: string; type: string; message: string; created_at: string; }

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    // Fetch initial alerts from maintenance_logs
    supabase.from('maintenance_logs').select('id, issue, severity, created_at').eq('status', 'open').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data) setAlerts(data.map(d => ({ id: d.id, type: d.severity, message: d.issue, created_at: d.created_at })));
      });

    // Supabase Realtime subscription
    const channel = supabase.channel('admin-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'maintenance_logs' }, payload => {
        const r = payload.new as { id: string; issue: string; severity: string; created_at: string };
        setAlerts(prev => [{ id: r.id, type: r.severity, message: r.issue, created_at: r.created_at }, ...prev]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const r = payload.new as { id: string; content: string; created_at: string };
        setAlerts(prev => [{ id: r.id, type: 'message', message: `رسالة جديدة: ${r.content.slice(0, 50)}`, created_at: r.created_at }, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const typeColors: Record<string, string> = { critical: '#f87171', high: '#fb923c', medium: '#60a5fa', low: '#4ade80', message: '#c9a96e' };

  return (
    <View style={{ flex: 1, backgroundColor: '#0c0a08' }}>
      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ color: 'rgba(245,240,232,0.45)', textAlign: 'center', marginTop: 40 }}>لا توجد تنبيهات</Text>}
        renderItem={({ item }) => (
          <View style={[styles.alert, { borderLeftColor: typeColors[item.type] ?? '#c9a96e' }]}>
            <Text style={{ color: typeColors[item.type] ?? '#c9a96e', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>{item.type}</Text>
            <Text style={{ color: '#f5f0e8', marginTop: 2, textAlign: 'right' }}>{item.message}</Text>
            <Text style={{ color: 'rgba(245,240,232,0.45)', fontSize: 10, marginTop: 4 }}>{new Date(item.created_at).toLocaleString('ar-SA')}</Text>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  alert: { backgroundColor: '#141210', borderWidth: 1, borderColor: 'rgba(201,169,110,0.18)', borderLeftWidth: 3, borderRadius: 8, padding: 12, marginBottom: 8 },
});
