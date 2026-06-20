'use client';

import { useMemo, useState } from 'react';
import { Button, Modal, Table, KPICard, Tabs, Select, Input, DatePicker, Textarea } from '@/components/ui';
import { TopBar, PageHeader } from '@/components/admin';
import { createClient } from '@/lib/supabase/client';
import { useExpenses } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import type { Expense, ExpenseTab } from '@/types';

type ExpenseFilter = 'all' | ExpenseTab;
type ExpenseRow = Expense & { property?: { id: string; internal_name: string } | null };
const tabs = [{ key: 'all', label: 'الكل' }, { key: 'purchases', label: 'مشتريات' }, { key: 'services', label: 'خدمات' }, { key: 'salaries', label: 'رواتب' }];
const categoryMap: Record<ExpenseTab, string[]> = { purchases: ['أثاث', 'أجهزة', 'مستلزمات تنظيف', 'أخرى'], services: ['كهرباء', 'ماء', 'إنترنت', 'تنظيف خارجي', 'صيانة خارجية', 'تسويق', 'أخرى'], salaries: ['مشرف', 'عامل نظافة', 'مدير حجوزات', 'أخرى'] };
const tabLabels: Record<ExpenseTab, string> = { purchases: 'مشتريات', services: 'خدمات', salaries: 'رواتب' };

export default function AdminExpensesPage() {
  const supabase = createClient() as any;
  const [activeTab, setActiveTab] = useState<ExpenseFilter>('all');
  const { data = [], isLoading, refetch } = useExpenses(activeTab === 'all' ? undefined : activeTab);
  const { data: properties = [] } = useProperties();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ tab: 'purchases' as ExpenseTab, category: 'أثاث', description: '', amount_sar: '', property_id: '', expense_date: new Date().toISOString().slice(0, 10), note: '', receipt_url: '' });
  const rows = data as ExpenseRow[];

  const kpis = useMemo(() => ({
    total: rows.reduce((s, e) => s + Number(e.amount_sar || 0), 0),
    purchases: rows.filter((e) => e.tab === 'purchases').reduce((s, e) => s + Number(e.amount_sar || 0), 0),
    services: rows.filter((e) => e.tab === 'services').reduce((s, e) => s + Number(e.amount_sar || 0), 0),
    salaries: rows.filter((e) => e.tab === 'salaries').reduce((s, e) => s + Number(e.amount_sar || 0), 0),
  }), [rows]);

  async function createExpense() {
    if (!form.description || !form.amount_sar) return;
    const payload = { ...form, property_id: form.property_id || null, amount_sar: Number(form.amount_sar), receipt_url: form.receipt_url || null, note: form.note || null };
    const response = await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) await supabase.from('expenses').insert(payload);
    setModalOpen(false); refetch();
  }

  async function deleteExpense(id: string) { const { error } = await supabase.from('expenses').delete().eq('id', id); if (!error) refetch(); }

  const columns = [
    { key: 'expense_date', header: 'التاريخ', render: (row: ExpenseRow) => new Date(row.expense_date).toLocaleDateString('ar-SA') },
    { key: 'category', header: 'الفئة' },
    { key: 'description', header: 'الوصف' },
    { key: 'property', header: 'الوحدة', render: (row: ExpenseRow) => row.property?.internal_name ?? 'عام' },
    { key: 'amount_sar', header: 'المبلغ SAR', render: (row: ExpenseRow) => Number(row.amount_sar).toLocaleString('ar-SA') },
    { key: 'note', header: 'ملاحظة', render: (row: ExpenseRow) => row.note ?? '-' },
    { key: 'actions', header: 'إجراءات', render: (row: ExpenseRow) => <div className="flex gap-2"><Button size="sm" variant="ghost">تعديل</Button><Button size="sm" variant="danger" onClick={() => deleteExpense(row.id)}>حذف</Button></div> },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar title="المصروفات" breadcrumb={[{ label: 'المالية' }, { label: 'المصروفات' }]} />
      <main className="space-y-6 p-6">
        <PageHeader title="إدارة المصروفات" subtitle="تسجيل مشتريات وخدمات ورواتب مع ربط اختياري بالوحدات." actions={<Button onClick={() => setModalOpen(true)}>إضافة مصروف</Button>} />
        <div className="grid gap-4 md:grid-cols-4"><KPICard label="الإجمالي SAR" value={kpis.total.toLocaleString('ar-SA')} className="border-hs-primary/40" /><KPICard label="المشتريات" value={kpis.purchases.toLocaleString('ar-SA')} className="border-hs-blue/40" /><KPICard label="الخدمات" value={kpis.services.toLocaleString('ar-SA')} className="border-hs-purple/40" /><KPICard label="الرواتب" value={kpis.salaries.toLocaleString('ar-SA')} className="border-hs-green/40" /></div>
        <Tabs tabs={tabs} active={activeTab} onChange={(key) => setActiveTab(key as ExpenseFilter)} />
        <Table columns={columns} data={rows} loading={isLoading} emptyMessage="لا توجد مصروفات" />
      </main>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="إضافة مصروف" size="lg"><div className="grid gap-4 md:grid-cols-2"><Select label="النوع" value={form.tab} onChange={(event) => { const tab = event.target.value as ExpenseTab; setForm({ ...form, tab, category: categoryMap[tab][0] }); }} options={[{ value: 'purchases', label: 'مشتريات' }, { value: 'services', label: 'خدمات' }, { value: 'salaries', label: 'رواتب' }]} /><Select label="الفئة" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} options={categoryMap[form.tab].map((category) => ({ value: category, label: category }))} /><Input label="الوصف" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><Input label="المبلغ SAR" type="number" value={form.amount_sar} onChange={(event) => setForm({ ...form, amount_sar: event.target.value })} /><Select label="الوحدة" placeholder="عام" value={form.property_id} onChange={(event) => setForm({ ...form, property_id: event.target.value })} options={properties.map((property) => ({ value: property.id, label: property.internal_name }))} /><DatePicker label="تاريخ المصروف" value={form.expense_date} onChange={(event) => setForm({ ...form, expense_date: event.target.value })} /><Input label="رابط الإيصال" value={form.receipt_url} onChange={(event) => setForm({ ...form, receipt_url: event.target.value })} /><div className="md:col-span-2"><Textarea label="ملاحظة" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></div><div className="md:col-span-2 flex justify-end gap-3"><Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button><Button onClick={createExpense}>حفظ المصروف</Button></div></div></Modal>
    </div>
  );
}
