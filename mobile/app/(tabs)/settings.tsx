import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import Constants from 'expo-constants';

export default function SettingsTab() {
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#0c0a08', padding: 24 }}>
      <Text style={{ fontSize: 22, color: '#f5f0e8', fontWeight: 'bold', textAlign: 'right', marginBottom: 24 }}>الإعدادات</Text>
      <View style={styles.section}>
        <Text style={styles.label}>الإصدار</Text>
        <Text style={styles.value}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>التطبيق</Text>
        <Text style={styles.value}>Horizon Stays Admin</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  section: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(201,169,110,0.1)' },
  label: { color: 'rgba(245,240,232,0.45)', fontSize: 14 },
  value: { color: '#f5f0e8', fontSize: 14, fontWeight: '500' },
  logoutBtn: { marginTop: 32, backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: '#f87171', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#f87171', fontWeight: 'bold', fontSize: 15 },
});
