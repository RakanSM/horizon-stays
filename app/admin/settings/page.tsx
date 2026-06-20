'use client';

import { useState } from 'react';
import { Button, Table, Badge, Tabs, Select, Input, Textarea } from '@/components/ui';
import { TopBar, PageHeader } from '@/components/admin';
import { createClient } from '@/lib/supabase/client';

const tabs = [{ key: 'payments', label: 'المدفوعات' }, { key: 'odoo', label: 'Odoo' }, { key: 'platforms', label: 'المنصات' }, { key: 'bank', label: 'البنك' }, { key: 'general', label: 'عام' }];
const platforms = ['Airbnb', 'Booking', 'Gatherin', 'Expedia'];

export default function AdminSettingsPage() {
  const supabase = createClient() as any;
  const [active, setActive] = useState('payments');
  const [status, setStatus] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState({ myfatoorah_key: '', env: 'test', bank_name: '', iban: 'SA2980209018452222121018', account_name: '', instructions: '' });
  const [odoo, setOdoo] = useState({ url: '', db: '', username: '', api_key: '', last_sync: '' });
  const [platformRows, setPlatformRows] = useState(platforms.map((name) => ({ id: name.toLowerCase(), name, secret: '', status: 'disconnected', last_sync: '-' })));
  const [general, setGeneral] = useState({ app_url: '', whatsapp: '0560903335', email: '' });

  async function saveSettings(section: string, value: unknown) {
    await supabase.from('settings').upsert({ key: section, value, updated_at: new Date().toISOString() });
    setStatus((current) => ({ ...current, [section]: 'saved' }));
  }

  async function callOdoo(action: 'status' | 'syncAll') {
    const response = await fetch('/api/odoo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...odoo }) });
    const result = await response.json().catch(() => ({}));
    setStatus((current) => ({ ...current, odoo: response.ok ? `✅ ${result.count ? `${result.count} عنصر` : 'متصل'}` : '❌ فشل الاتصال' }));
    if (action === 'syncAll') setOdoo((current) => ({ ...current, last_sync: new Date().toLocaleString('ar-SA') }));
  }

  async function importBank(file?: File) {
    if (!file) return;
    const body = new FormData(); body.append('file', file);
    await fetch('/api/bank/import', { method: 'POST', body });
    setStatus((current) => ({ ...current, bank: 'تم إرسال كشف الحساب للمطابقة' }));
  }

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar title="الإعدادات" breadcrumb={[{ label: 'الإدارة' }, { label: 'الإعدادات' }]} />
      <main className="space-y-6 p-6">
        <PageHeader title="إعدادات النظام والتكاملات" subtitle="إدارة بوابات الدفع، Odoo، المنصات، البنك، والبيانات العامة." />
        <Tabs tabs={tabs} active={active} onChange={setActive} />

        {active === 'payments' && <section className="grid gap-6 xl:grid-cols-2"><div className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><h2 className="font-serif text-lg font-semibold">MyFatoorah</h2><div className="mt-4 grid gap-4"><Input label="API Key" type="password" value={payment.myfatoorah_key} onChange={(event) => setPayment({ ...payment, myfatoorah_key: event.target.value })} /><Select label="Environment" value={payment.env} onChange={(event) => setPayment({ ...payment, env: event.target.value })} options={[{ value: 'test', label: 'test' }, { value: 'live', label: 'live' }]} /><div className="flex flex-wrap gap-2">{['Mada', 'Visa', 'MasterCard', 'Apple Pay', 'STC Pay', 'Tabby', 'Tamara'].map((method) => <Badge key={method} variant="synced" label={method} />)}</div><Button onClick={() => saveSettings('payments', payment)}>حفظ المدفوعات</Button>{status.payments && <p className="text-sm text-hs-green">تم الحفظ</p>}</div></div><div className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><h2 className="font-serif text-lg font-semibold">Bank Transfer</h2><div className="mt-4 grid gap-4"><Input label="اسم البنك" value={payment.bank_name} onChange={(event) => setPayment({ ...payment, bank_name: event.target.value })} /><Input label="IBAN" value={payment.iban} onChange={(event) => setPayment({ ...payment, iban: event.target.value })} /><Input label="اسم الحساب" value={payment.account_name} onChange={(event) => setPayment({ ...payment, account_name: event.target.value })} /><Textarea label="تعليمات التحويل" value={payment.instructions} onChange={(event) => setPayment({ ...payment, instructions: event.target.value })} /><Button onClick={() => saveSettings('bank_transfer', payment)}>حفظ بيانات التحويل</Button></div></div></section>}

        {active === 'odoo' && <section className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><div className="grid gap-4 md:grid-cols-2"><Input label="Odoo URL" value={odoo.url} onChange={(event) => setOdoo({ ...odoo, url: event.target.value })} /><Input label="DB" value={odoo.db} onChange={(event) => setOdoo({ ...odoo, db: event.target.value })} /><Input label="Username" value={odoo.username} onChange={(event) => setOdoo({ ...odoo, username: event.target.value })} /><Input label="API Key" type="password" value={odoo.api_key} onChange={(event) => setOdoo({ ...odoo, api_key: event.target.value })} /></div><div className="mt-5 flex flex-wrap items-center gap-3"><Button onClick={() => callOdoo('status')}>اختبار الاتصال</Button><Button variant="outline" onClick={() => callOdoo('syncAll')}>مزامنة كل المعلقة</Button><span className="text-sm text-hs-muted">آخر مزامنة: {odoo.last_sync || 'لم تتم بعد'}</span>{status.odoo && <span className="text-sm text-hs-primary">{status.odoo}</span>}</div></section>}

        {active === 'platforms' && <section className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><Table columns={[{ key: 'name', header: 'المنصة' }, { key: 'secret', header: 'API/Webhook Secret', render: (row: any) => <Input type="password" value={row.secret} onChange={(event) => setPlatformRows((current) => current.map((item) => item.id === row.id ? { ...item, secret: event.target.value } : item))} /> }, { key: 'status', header: 'الحالة', render: (row: any) => <Badge variant={row.status === 'synced' ? 'synced' : 'disconnected'} label={row.status === 'synced' ? 'متصل' : 'غير متصل'} /> }, { key: 'sync', header: 'مزامنة', render: (row: any) => <Button size="sm" variant="outline" onClick={() => setPlatformRows((current) => current.map((item) => item.id === row.id ? { ...item, status: 'synced', last_sync: new Date().toLocaleString('ar-SA') } : item))}>Sync</Button> }, { key: 'last_sync', header: 'آخر مزامنة' }]} data={platformRows} /></section>}

        {active === 'bank' && <section className="space-y-5"><div className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><h2 className="font-serif text-lg font-semibold">بيانات البنك</h2><p className="mt-2 text-hs-muted">{payment.bank_name || 'اسم البنك غير محدد'} — IBAN: {payment.iban}</p><label className="mt-4 inline-flex cursor-pointer items-center rounded-md border border-hs-primary px-4 py-2 text-sm text-hs-primary hover:bg-hs-primary hover:text-hs-bg"><input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => importBank(event.target.files?.[0])} />استيراد كشف حساب</label>{status.bank && <p className="mt-3 text-sm text-hs-primary">{status.bank}</p>}</div><Table columns={[{ key: 'type', header: 'النوع' }, { key: 'count', header: 'العدد' }, { key: 'amount', header: 'الإجمالي' }]} data={[{ id: 'matched', type: 'مطابقة', count: 0, amount: '0 SAR' }, { id: 'unmatched', type: 'غير مطابقة', count: 0, amount: '0 SAR' }]} /></section>}

        {active === 'general' && <section className="rounded-xl border border-hs-border bg-hs-bg2 p-5"><div className="grid gap-4 md:grid-cols-2"><Input label="App URL" value={general.app_url} onChange={(event) => setGeneral({ ...general, app_url: event.target.value })} /><Input label="WhatsApp number" value={general.whatsapp} onChange={(event) => setGeneral({ ...general, whatsapp: event.target.value })} /><Input label="Contact email" type="email" value={general.email} onChange={(event) => setGeneral({ ...general, email: event.target.value })} /><div className="flex items-end"><Button onClick={() => saveSettings('general', general)}>حفظ عام</Button></div></div></section>}
      </main>
    </div>
  );
}
