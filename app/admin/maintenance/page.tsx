'use client';

import { useMemo, useState } from 'react';
import { Button, Modal, Table, Badge, KPICard, Select, Textarea } from '@/components/ui';
import { TopBar, PageHeader } from '@/components/admin';
import { createClient } from '@/lib/supabase/client';
import { useMaintenanceLogs } from '@/hooks/useMaintenanceLogs';
import { useProperties } from '@/hooks/useProperties';
import type { MaintenanceLog, MaintenanceStatus, Severity } from '@/types';

type MaintenanceRow = MaintenanceLog & { property?: { id: string; internal_name: string } | null };

const severityLabels: Record<Severity, string> = { critical: 'حرج', high: 'عالي', medium: 'متوسط', low: 'منخفض' };
const statusLabels: Record<MaintenanceStatus, string> = { open: 'مفتوح', in_progress: 'قيد التنفيذ', resolved: 'محلول' };

function statusVariant(status: MaintenanceStatus) {
  if (status === 'open') return 'pending';
  if (status === 'in_progress') return 'medium';
  return 'confirmed';
}

export default function AdminMaintenancePage() {
  const supabase = createClient() as any;
  const { data = [], isLoading, refetch } = useMaintenanceLogs();
  const { data: properties = [] } = useProperties();
  const [filters, setFilters] = useState({ property: '', severity: '', status: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ property_id: '', issue: '', severity: 'medium' as Severity, notes: '' });

  const rows = data as MaintenanceRow[];
  const filtered = useMemo(() => rows.filter((row) => {
    return (!filters.property || row.property_id === filters.property) && (!filters.severity || row.severity === filters.severity) && (!filters.status || row.status === filters.status);
  }), [rows, filters]);

  const now = new Date();
  const kpis = useMemo(() => ({
    critical: rows.filter((row) => row.status !== 'resolved' && row.severity === 'critical').length,
    high: rows.filter((row) => row.status !== 'resolved' && row.severity === 'high').length,
    inProgress: rows.filter((row) => row.status === 'in_progress').length,
    resolvedThisMonth: rows.filter((row) => row.status === 'resolved' && row.resolved_at && new Date(row.resolved_at).getMonth() === now.getMonth() && new Date(row.resolved_at).getFullYear() === now.getFullYear()).length,
  }), [rows]);

  async function resolveLog(id: string) {
    await fetch(`/api/maintenance/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved', resolved_at: new Date().toISOString() }) });
    refetch();
  }

  async function createLog() {
    if (!form.property_id || !form.issue) return;
    const { error } = await supabase.from('maintenance_logs').insert({
      property_id: form.property_id,
      issue: form.issue,
      severity: form.severity,
      notes: form.notes || null,
      status: 'open',
    });
    if (!error) {
      setForm({ property_id: '', issue: '', severity: 'medium', notes: '' });
      setModalOpen(false);
      refetch();
    }
  }

  const columns = [
    { key: 'property', header: 'الوحدة', render: (row: MaintenanceRow) => row.property?.internal_name ?? row.property_id.slice(0, 8) },
    { key: 'issue', header: 'البلاغ' },
    { key: 'severity', header: 'الخطورة', render: (row: MaintenanceRow) => <Badge variant={row.severity} label={severityLabels[row.severity]} /> },
    { key: 'status', header: 'الحالة', render: (row: MaintenanceRow) => <Badge variant={statusVariant(row.status) as any} label={statusLabels[row.status]} /> },
    { key: 'created_at', header: 'تاريخ الإنشاء', render: (row: MaintenanceRow) => new Date(row.created_at).toLocaleDateString('ar-SA') },
    { key: 'actions', header: 'إجراء', render: (row: MaintenanceRow) => row.status !== 'resolved' ? <Button size="sm" variant="outline" onClick={() => resolveLog(row.id)}>حل</Button> : <span className="text-hs-muted">تم الحل</span> },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar title="سجل الصيانة" breadcrumb={[{ label: 'العمليات' }, { label: 'الصيانة' }]} />
      <main className="space-y-6 p-6">
        <PageHeader title="سجل بلاغات الصيانة" subtitle="إدارة البلاغات الحرجة والعادية مع تصفية حسب الوحدة والخطورة والحالة." actions={<Button onClick={() => setModalOpen(true)}>رفع بلاغ صيانة</Button>} />
        <div className="grid gap-4 md:grid-cols-4"><KPICard label="حرج مفتوح" value={kpis.critical} className="border-hs-red/40" /><KPICard label="عالي مفتوح" value={kpis.high} className="border-orange-500/40" /><KPICard label="قيد التنفيذ" value={kpis.inProgress} className="border-hs-blue/40" /><KPICard label="محلول هذا الشهر" value={kpis.resolvedThisMonth} className="border-hs-muted/40" /></div>
        <div className="rounded-xl border border-hs-primary/30 bg-hs-primary/10 p-4 text-sm text-hs-primary">عند مسامحة مطالبة تلف، يُنشأ سجل صيانة تلقائياً</div>
        <div className="grid gap-3 rounded-xl border border-hs-border bg-hs-bg2 p-4 md:grid-cols-3"><Select label="الوحدة" placeholder="كل الوحدات" value={filters.property} onChange={(event) => setFilters({ ...filters, property: event.target.value })} options={properties.map((property) => ({ value: property.id, label: property.internal_name }))} /><Select label="الخطورة" placeholder="كل مستويات الخطورة" value={filters.severity} onChange={(event) => setFilters({ ...filters, severity: event.target.value })} options={Object.entries(severityLabels).map(([value, label]) => ({ value, label }))} /><Select label="الحالة" placeholder="كل الحالات" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} /></div>
        <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="لا توجد بلاغات صيانة" />
      </main>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="رفع بلاغ صيانة" size="lg"><div className="grid gap-4 md:grid-cols-2"><Select label="الوحدة" placeholder="اختر الوحدة" value={form.property_id} onChange={(event) => setForm({ ...form, property_id: event.target.value })} options={properties.map((property) => ({ value: property.id, label: property.internal_name }))} /><Select label="الخطورة" value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as Severity })} options={Object.entries(severityLabels).map(([value, label]) => ({ value, label }))} /><div className="md:col-span-2"><Textarea label="وصف المشكلة" value={form.issue} onChange={(event) => setForm({ ...form, issue: event.target.value })} /></div><div className="md:col-span-2"><Textarea label="ملاحظات" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div><div className="md:col-span-2 rounded-lg border border-dashed border-hs-border p-4 text-sm text-hs-muted">تلميح: يمكن إضافة رفع الصور لاحقاً وربطها بسجل الصيانة.</div><div className="md:col-span-2 flex justify-end gap-3"><Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button><Button onClick={createLog}>حفظ البلاغ</Button></div></div></Modal>
    </div>
  );
}
