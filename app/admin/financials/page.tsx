'use client';

import { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Button, Modal, Table, Badge, KPICard, Tabs, Select, DatePicker, Textarea } from '@/components/ui';
import { TopBar, PageHeader } from '@/components/admin';
import { createClient } from '@/lib/supabase/client';
import { useBookings } from '@/hooks/useBookings';
import { useExpenses } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyOwners } from '@/hooks/usePropertyOwners';
import type { Booking, BookingTransfer, Property } from '@/types';

const mainTabs = [{ key: 'revenue', label: 'الإيرادات والمصروفات' }, { key: 'owners', label: 'حساب كشف المالك' }, { key: 'reports', label: 'تقارير مفصلة' }, { key: 'transfers', label: 'نقل الحجوزات' }];
const reportTabs = [{ key: 'pl', label: 'P&L' }, { key: 'trial', label: 'Trial Balance' }, { key: 'balance', label: 'Balance Sheet' }];
const colors = ['#c9a45c', '#ef4444', '#3b82f6', '#8b5cf6', '#22c55e'];

export default function AdminFinancialsPage() {
  const supabase = createClient() as any;
  const [active, setActive] = useState('revenue');
  const [report, setReport] = useState('pl');
  const [ownerId, setOwnerId] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [transfer, setTransfer] = useState({ booking_id: '', to_property_id: '', reason: '' });
  const { data: bookings = [] } = useBookings();
  const { data: expenses = [] } = useExpenses();
  const { data: properties = [] } = useProperties();
  const { data: owners = [] } = usePropertyOwners();

  const monthly = useMemo(() => Array.from({ length: 12 }, (_, month) => {
    const revenue = bookings.filter((b) => new Date(b.check_in).getMonth() === month).reduce((s, b) => s + Number(b.amount_sar || 0), 0);
    const cost = expenses.filter((e) => new Date(e.expense_date).getMonth() === month).reduce((s, e) => s + Number(e.amount_sar || 0), 0);
    return { month: new Date(2026, month, 1).toLocaleString('ar-SA', { month: 'short' }), revenue, expenses: cost };
  }), [bookings, expenses]);

  const platformPie = useMemo(() => Object.entries(bookings.reduce((acc, booking) => ({ ...acc, [booking.platform]: (acc[booking.platform] ?? 0) + Number(booking.amount_sar || 0) }), {} as Record<string, number>)).map(([name, value]) => ({ name, value })), [bookings]);

  const profitability = (properties as Property[]).map((property) => {
    const revenue = bookings.filter((b) => b.property_id === property.id).reduce((s, b) => s + Number(b.amount_sar || 0), 0);
    const cost = expenses.filter((e) => e.property_id === property.id).reduce((s, e) => s + Number(e.amount_sar || 0), 0);
    return { id: property.id, property: property.internal_name, revenue, expenses: cost, net: revenue - cost, occupancy: property.status === 'occupied' ? '100%' : '0%' };
  });

  const selectedOwner = owners.find((owner) => owner.id === ownerId) ?? owners[0];
  const ownerProperties = properties.filter((property) => property.owner_id === selectedOwner?.id);
  const ownerBookings = bookings.filter((booking) => ownerProperties.some((property) => property.id === booking.property_id));
  const ownerRevenue = ownerBookings.reduce((sum, booking) => sum + Number(booking.amount_sar || 0), 0);
  const managementFees = ownerRevenue * Number(selectedOwner?.management_fee_pct ?? 0) / 100;
  const netDue = ownerRevenue - managementFees;

  async function transferBooking() {
    if (!transfer.booking_id || !transfer.to_property_id || !transfer.reason) return;
    await fetch('/api/bookings/transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transfer) });
    setTransferOpen(false);
  }

  const transferRows: (BookingTransfer & { guest?: string; from?: string; to?: string; admin?: string })[] = [];

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar title="التقارير المالية" breadcrumb={[{ label: 'المالية' }, { label: 'التقارير' }]} />
      <main className="space-y-6 p-6">
        <PageHeader title="لوحة التقارير المالية" subtitle="إيرادات، مصروفات، كشوف ملاك، وتقارير محاسبية مفصلة." actions={<Button variant="outline" onClick={() => window.open('/api/export/excel?type=financials', '_blank')}>Export CSV</Button>} />
        <Tabs tabs={mainTabs} active={active} onChange={setActive} />

        {active === 'revenue' && <section className="space-y-6"><div className="grid gap-4 xl:grid-cols-2"><div className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><h2 className="mb-4 font-serif text-lg font-semibold">الإيرادات مقابل المصروفات</h2><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="revenue" name="الإيرادات" fill="#c9a45c" /><Bar dataKey="expenses" name="المصروفات" fill="#ef4444" /></BarChart></ResponsiveContainer></div></div><div className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><h2 className="mb-4 font-serif text-lg font-semibold">إيرادات المنصات</h2><div className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={platformPie} dataKey="value" nameKey="name" outerRadius={110} label>{platformPie.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div></div><Table columns={[{ key: 'property', header: 'الوحدة' }, { key: 'revenue', header: 'الإيرادات', render: (r: any) => r.revenue.toLocaleString('ar-SA') }, { key: 'expenses', header: 'المصروفات', render: (r: any) => r.expenses.toLocaleString('ar-SA') }, { key: 'net', header: 'صافي الربح', render: (r: any) => r.net.toLocaleString('ar-SA') }, { key: 'occupancy', header: 'الإشغال %' }]} data={profitability} /></section>}

        {active === 'owners' && <section className="space-y-6"><Select label="المالك" value={selectedOwner?.id ?? ''} onChange={(event) => setOwnerId(event.target.value)} options={owners.map((owner) => ({ value: owner.id, label: owner.owner_name }))} /><div className="grid gap-4 md:grid-cols-4"><KPICard label="إجمالي الإيرادات" value={ownerRevenue.toLocaleString('ar-SA')} /><KPICard label="رسوم الإدارة" value={managementFees.toLocaleString('ar-SA')} /><KPICard label="الصافي للمالك" value={netDue.toLocaleString('ar-SA')} /><KPICard label="الرصيد المستحق" value={Number(selectedOwner?.balance_due ?? 0).toLocaleString('ar-SA')} /></div><div className="flex gap-3"><Button onClick={() => window.open(`/api/export/excel?type=owner_statement&ownerId=${selectedOwner?.id}`, '_blank')}>توليد كشف حساب</Button><Button variant="outline" onClick={() => fetch(`/api/owners/${selectedOwner?.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ balance_due: 0 }) })}>تسجيل تحويل</Button></div><Table columns={[{ key: 'guest_name', header: 'الحجز' }, { key: 'amount_sar', header: 'دخل الحجز', render: (r: Booking) => Number(r.amount_sar).toLocaleString('ar-SA') }, { key: 'fee', header: 'خصم الإدارة', render: (r: Booking) => (Number(r.amount_sar) * Number(selectedOwner?.management_fee_pct ?? 0) / 100).toLocaleString('ar-SA') }, { key: 'net', header: 'الصافي', render: (r: Booking) => (Number(r.amount_sar) * (1 - Number(selectedOwner?.management_fee_pct ?? 0) / 100)).toLocaleString('ar-SA') }, { key: 'balance', header: 'الرصيد المتبقي', render: () => Number(selectedOwner?.balance_due ?? 0).toLocaleString('ar-SA') }]} data={ownerBookings} /></section>}

        {active === 'reports' && <section className="space-y-4"><Tabs tabs={reportTabs} active={report} onChange={setReport} /><div className="flex gap-3"><DatePicker label="من" /><DatePicker label="إلى" /></div>{report === 'pl' && <Table columns={[{ key: 'scope', header: 'النطاق' }, { key: 'revenue', header: 'الإيرادات' }, { key: 'expenses', header: 'المصروفات' }, { key: 'net', header: 'الصافي' }]} data={[{ id: 'company', scope: 'الشركة', revenue: ownerRevenue, expenses: expenses.reduce((s, e) => s + Number(e.amount_sar || 0), 0), net: ownerRevenue - expenses.reduce((s, e) => s + Number(e.amount_sar || 0), 0) }, { id: 'property', scope: 'حسب الوحدة', revenue: 'متاح في جدول الربحية', expenses: '-', net: '-' }, { id: 'owner', scope: 'حسب المالك', revenue: ownerRevenue, expenses: managementFees, net: netDue }, { id: 'platform', scope: 'حسب المنصة', revenue: 'انظر الرسم', expenses: '-', net: '-' }]} />}{report === 'trial' && <Table columns={[{ key: 'account', header: 'الحساب' }, { key: 'debit', header: 'مدين' }, { key: 'credit', header: 'دائن' }, { key: 'balance', header: 'الرصيد' }]} data={[{ id: 'rev', account: 'الإيرادات', debit: 0, credit: ownerRevenue, balance: ownerRevenue }, { id: 'exp', account: 'المصروفات', debit: expenses.length, credit: 0, balance: -expenses.length }]} />}{report === 'balance' && <div className="grid gap-4 md:grid-cols-3"><KPICard label="الأصول: ذمم مدينة" value={ownerRevenue.toLocaleString('ar-SA')} /><KPICard label="الالتزامات: مستحقات ملاك" value={Number(selectedOwner?.balance_due ?? 0).toLocaleString('ar-SA')} /><KPICard label="حقوق الملكية" value={(ownerRevenue - Number(selectedOwner?.balance_due ?? 0)).toLocaleString('ar-SA')} /></div>}</section>}

        {active === 'transfers' && <section className="space-y-6"><div className="grid gap-4 md:grid-cols-3"><KPICard label="التحويلات هذا الشهر" value={transferRows.length} /><KPICard label="الوحدات الأكثر تأثراً" value="قيد التجميع" /><KPICard label="أثر الإيرادات" value="± 0 SAR" /></div><Button onClick={() => setTransferOpen(true)}>نقل حجز جديد</Button><Table columns={[{ key: 'id', header: 'Transfer ID' }, { key: 'guest', header: 'الضيف' }, { key: 'from', header: 'من وحدة' }, { key: 'to', header: 'إلى وحدة' }, { key: 'transfer_reason', header: 'السبب' }, { key: 'created_at', header: 'التاريخ' }, { key: 'admin', header: 'المسؤول' }, { key: 'revenue_impact', header: 'أثر الإيرادات', render: (row: any) => <Badge variant={row.revenue_impact >= 0 ? 'confirmed' : 'error'} label={`${row.revenue_impact ?? 0} SAR`} /> }]} data={transferRows} emptyMessage="لا توجد عمليات نقل" /></section>}
      </main>
      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="نقل حجز جديد" size="lg"><div className="grid gap-4"><Select label="الحجز" value={transfer.booking_id} onChange={(event) => setTransfer({ ...transfer, booking_id: event.target.value })} options={bookings.filter((booking) => booking.status === 'confirmed').map((booking) => ({ value: booking.id, label: `${booking.guest_name} — ${booking.check_in}` }))} /><Select label="الوحدة البديلة المتاحة" value={transfer.to_property_id} onChange={(event) => setTransfer({ ...transfer, to_property_id: event.target.value })} options={properties.map((property) => ({ value: property.id, label: property.internal_name }))} /><Textarea label="سبب النقل" value={transfer.reason} onChange={(event) => setTransfer({ ...transfer, reason: event.target.value })} /><div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setTransferOpen(false)}>إلغاء</Button><Button onClick={transferBooking}>تنفيذ النقل</Button></div></div></Modal>
    </div>
  );
}
