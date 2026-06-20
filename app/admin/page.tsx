'use client';
import { TopBar } from '@/components/admin/TopBar';
import { KPICard } from '@/components/ui/KPICard';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';
import { useBookings } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const { data: kpis, isLoading } = useDashboardKPIs();
  const { data: bookings } = useBookings();

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('ar-SA', { month: 'short' });
    const monthStr = d.toISOString().slice(0, 7);
    const revenue = (bookings ?? [])
      .filter(b => b.check_in.startsWith(monthStr) && b.status !== 'cancelled')
      .reduce((s, b) => s + b.amount_sar, 0);
    return { month: label, revenue };
  });

  const platformData = ['airbnb', 'booking', 'gatherin', 'direct', 'expedia'].map(p => ({
    name: p,
    value: (bookings ?? []).filter(b => b.platform === p && b.status !== 'cancelled').reduce((s, b) => s + b.amount_sar, 0),
  })).filter(p => p.value > 0);

  const COLORS = ['#FF5A5F', '#4a90d9', '#c9a96e', '#c9a96e', '#1d4e89'];

  const kpiList = kpis ? [
    { label: 'الحجوزات النشطة', value: kpis.activeBookings, icon: '📅' },
    { label: 'نسبة الإشغال', value: `${kpis.occupancyRate}%`, icon: '📊' },
    { label: 'إيرادات اليوم', value: formatCurrency(kpis.todayRevenue), icon: '💰' },
    { label: 'إيرادات الشهر', value: formatCurrency(kpis.monthRevenue), icon: '📈', highlight: true },
    { label: 'بانتظار الموافقة', value: kpis.pendingApprovals, icon: '⏳' },
    { label: 'أيام غير محجوزة', value: kpis.unbookedDaysThisMonth, icon: '📭' },
    { label: 'مهام التنظيف', value: kpis.cleaningTasksPending, icon: '🧹' },
    { label: 'تنبيهات الصيانة', value: kpis.maintenanceAlerts, icon: '🔧' },
    { label: 'RevPAR', value: formatCurrency(kpis.revpar), icon: '🏢' },
    { label: 'ADR', value: formatCurrency(kpis.adr), icon: '💵' },
    { label: 'متوسط الإيراد/وحدة', value: formatCurrency(kpis.avgRevenuePerProperty), icon: '🏠' },
    { label: 'مستحقات الملاك', value: formatCurrency(kpis.totalOutstandingOwnerDues), icon: '👤', highlight: true },
  ] : [];

  return (
    <div dir="rtl">
      <TopBar title="لوحة التحكم" breadcrumb={[{ label: 'الرئيسية' }]} />
      <div className="p-6 space-y-8">
        {isLoading ? (
          <div className="text-hs-muted text-center py-10">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {kpiList.map((k, i) => (
              <KPICard key={i} value={k.value} label={k.label} icon={<span>{k.icon}</span>} highlight={k.highlight} />
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-hs-bg2 border border-hs-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-hs-muted mb-4 uppercase tracking-wider">الإيرادات — آخر 6 أشهر</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.1)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(245,240,232,0.45)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(245,240,232,0.45)', fontSize: 12 }} axisLine={false} tickFormatter={v => `${Number(v) / 1000}k`} />
                <Tooltip contentStyle={{ background: '#141210', border: '1px solid rgba(201,169,110,0.18)', borderRadius: 8 }} formatter={(v: number) => [formatCurrency(v), 'إيراد']} />
                <Bar dataKey="revenue" fill="#c9a96e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-hs-bg2 border border-hs-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-hs-muted mb-4 uppercase tracking-wider">توزيع المنصات</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={platformData.length ? platformData : [{ name: 'لا بيانات', value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                  {(platformData.length ? platformData : [{ name: '-' }]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#141210', border: '1px solid rgba(201,169,110,0.18)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {platformData.map((p, i) => (
                <span key={i} className="text-xs flex items-center gap-1.5 text-hs-muted">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
