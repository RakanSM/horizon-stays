'use client';

import { useMemo, useState } from 'react';
import { Button, Modal, Table, Badge, KPICard, Select, Input, Textarea } from '@/components/ui';
import { TopBar, PageHeader } from '@/components/admin';
import { createClient } from '@/lib/supabase/client';
import { useClaims } from '@/hooks/useClaims';
import { useProperties } from '@/hooks/useProperties';
import type { Booking, Claim, ClaimStatus } from '@/types';

type ClaimRow = Claim & { booking?: Booking | null; property?: { id: string; internal_name: string } | null };
const statusLabels: Record<ClaimStatus, string> = { pending: 'معلقة', paid: 'مدفوعة', forgiven: 'مسامحة', extension_requested: 'طلب تمديد', approved_extension: 'تمديد معتمد' };

export default function AdminClaimsPage() {
  const supabase = createClient() as any;
  const { data = [], isLoading, refetch } = useClaims();
  const { data: properties = [] } = useProperties();
  const [modalOpen, setModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState({ property_id: '', booking_id: '', description: '', amount_sar: '', due_date: '' });
  const rows = data as ClaimRow[];

  const kpis = useMemo(() => ({
    pending: rows.filter((row) => row.status === 'pending').length,
    paid: rows.filter((row) => row.status === 'paid').length,
    forgiven: rows.filter((row) => row.status === 'forgiven').length,
    total: rows.reduce((sum, row) => sum + Number(row.amount_sar || 0), 0),
  }), [rows]);

  async function loadBookings(propertyId: string) {
    setForm((current) => ({ ...current, property_id: propertyId, booking_id: '' }));
    if (!propertyId) return setBookings([]);
    const { data: bookingData } = await supabase.from('bookings').select('*').eq('property_id', propertyId).order('created_at', { ascending: false });
    setBookings(bookingData ?? []);
  }

  async function patchClaim(id: string, payload: Record<string, unknown>) {
    await fetch(`/api/claims/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    refetch();
  }

  async function createClaim() {
    if (!form.property_id || !form.description || !form.amount_sar) return;
    const { error } = await supabase.from('claims').insert({ property_id: form.property_id, booking_id: form.booking_id || null, description: form.description, amount_sar: Number(form.amount_sar), due_date: form.due_date || null, status: 'pending', evidence_urls: [] });
    if (!error) { setModalOpen(false); setForm({ property_id: '', booking_id: '', description: '', amount_sar: '', due_date: '' }); refetch(); }
  }

  const columns = [
    { key: 'id', header: 'ID', render: (row: ClaimRow) => row.id.slice(0, 8) },
    { key: 'guest', header: 'الضيف', render: (row: ClaimRow) => row.booking?.guest_name ?? 'غير مرتبط' },
    { key: 'property', header: 'الوحدة', render: (row: ClaimRow) => row.property?.internal_name ?? row.property_id?.slice(0, 8) ?? '-' },
    { key: 'description', header: 'الوصف' },
    { key: 'amount_sar', header: 'المبلغ SAR', render: (row: ClaimRow) => Number(row.amount_sar).toLocaleString('ar-SA') },
    { key: 'status', header: 'الحالة', render: (row: ClaimRow) => <Badge variant={row.status} label={statusLabels[row.status]} /> },
    { key: 'due_date', header: 'تاريخ الاستحقاق', render: (row: ClaimRow) => row.extended_due_date ?? row.due_date ?? '-' },
    { key: 'actions', header: 'إجراءات', render: (row: ClaimRow) => <div className="flex flex-wrap gap-2">{row.status === 'pending' && <><Button size="sm" variant="outline" onClick={() => patchClaim(row.id, { status: 'paid' })}>تم الدفع</Button><Button size="sm" variant="ghost" onClick={() => patchClaim(row.id, { status: 'forgiven' })}>مسامحة</Button><Button size="sm" variant="ghost" disabled>رفع فاتورة</Button></>}{row.status === 'extension_requested' && <Button size="sm" onClick={() => patchClaim(row.id, { status: 'approved_extension', extended_due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) })}>السماح بالتمديد</Button>}</div> },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar title="المطالبات" breadcrumb={[{ label: 'المالية' }, { label: 'المطالبات' }]} />
      <main className="space-y-6 p-6">
        <PageHeader title="إدارة مطالبات التلف" subtitle="متابعة المطالبات، السداد، المسامحة، وطلبات التمديد." actions={<Button onClick={() => setModalOpen(true)}>مطالبة جديدة</Button>} />
        <div className="grid gap-4 md:grid-cols-4"><KPICard label="معلقة" value={kpis.pending} className="border-hs-red/40" /><KPICard label="مدفوعة" value={kpis.paid} className="border-hs-green/40" /><KPICard label="مسامحة" value={kpis.forgiven} className="border-hs-purple/40" /><KPICard label="إجمالي SAR" value={kpis.total.toLocaleString('ar-SA')} className="border-hs-primary/40" /></div>
        <div className="rounded-xl border border-hs-purple/30 bg-hs-purple/10 p-4 text-sm text-hs-purple">عند اختيار مسامحة، يتم إنشاء سجل صيانة تلقائياً لمعالجة التلف داخلياً.</div>
        <Table columns={columns} data={rows} loading={isLoading} emptyMessage="لا توجد مطالبات" />
        <section className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><h2 className="font-serif text-lg font-semibold">ملاحظة بوابة الضيف</h2><p className="mt-2 text-hs-muted">البوابة متاحة على /guest/claims</p></section>
      </main>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="مطالبة جديدة" size="lg"><div className="grid gap-4 md:grid-cols-2"><Select label="الوحدة" placeholder="اختر الوحدة" value={form.property_id} onChange={(event) => loadBookings(event.target.value)} options={properties.map((property) => ({ value: property.id, label: property.internal_name }))} /><Select label="الحجز" placeholder="اختر الحجز" value={form.booking_id} onChange={(event) => setForm({ ...form, booking_id: event.target.value })} options={bookings.map((booking) => ({ value: booking.id, label: `${booking.guest_name} — ${booking.platform_booking_id ?? booking.id.slice(0, 8)}` }))} /><Input label="المبلغ SAR" type="number" value={form.amount_sar} onChange={(event) => setForm({ ...form, amount_sar: event.target.value })} /><Input label="تاريخ الاستحقاق" type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /><div className="md:col-span-2"><Textarea label="الوصف" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div><div className="md:col-span-2 rounded-lg border border-dashed border-hs-border p-4 text-sm text-hs-muted">تلميح: الصور ترفع إلى Supabase Storage وتربط مع evidence_urls.</div><div className="md:col-span-2 flex justify-end gap-3"><Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button><Button onClick={createClaim}>حفظ المطالبة</Button></div></div></Modal>
    </div>
  );
}
