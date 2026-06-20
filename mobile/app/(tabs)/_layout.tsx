import { Tabs } from 'expo-router';
import { Text } from 'react-native';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: '#141210', borderTopColor: 'rgba(201,169,110,0.18)' },
      tabBarActiveTintColor: '#c9a96e',
      tabBarInactiveTintColor: 'rgba(245,240,232,0.45)',
      headerStyle: { backgroundColor: '#0c0a08' },
      headerTintColor: '#f5f0e8',
    }}>
      <Tabs.Screen name="index" options={{ title: 'الرئيسية', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⬛</Text> }} />
      <Tabs.Screen name="bookings" options={{ title: 'الحجوزات', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📅</Text> }} />
      <Tabs.Screen name="calendar" options={{ title: 'التقويم', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🗓️</Text> }} />
      <Tabs.Screen name="alerts" options={{ title: 'التنبيهات', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔔</Text> }} />
      <Tabs.Screen name="settings" options={{ title: 'الإعدادات', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text> }} />
    </Tabs>
  );
}
