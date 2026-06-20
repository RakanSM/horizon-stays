import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('خطأ', error.message);
    else router.replace('/(tabs)/');
  }

  async function handleBiometric() {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'تسجيل الدخول بالبصمة', cancelLabel: 'إلغاء' });
    if (result.success) router.replace('/(tabs)/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horizon Stays</Text>
      <Text style={styles.subtitle}>لوحة الإدارة</Text>
      <TextInput style={styles.input} placeholder="البريد الإلكتروني" placeholderTextColor="#6b6560" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="كلمة المرور" placeholderTextColor="#6b6560" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'جاري الدخول...' : 'دخول'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={handleBiometric}>
        <Text style={[styles.btnText, { color: '#c9a96e' }]}>🔐 تسجيل بالبصمة</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0a08', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, color: '#c9a96e', fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(245,240,232,0.45)', marginBottom: 32 },
  input: { width: '100%', backgroundColor: '#141210', borderWidth: 1, borderColor: 'rgba(201,169,110,0.18)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, color: '#f5f0e8', marginBottom: 12, textAlign: 'right' },
  btn: { width: '100%', backgroundColor: '#c9a96e', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#c9a96e' },
  btnText: { color: '#0c0a08', fontWeight: 'bold', fontSize: 16 },
});
