'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Modal, Table, Badge, DatePicker, Input } from '@/components/ui';
import { TopBar, PageHeader } from '@/components/admin';
import { useProperties } from '@/hooks/useProperties';
import type { LockStatus, Property } from '@/types';

type LockProperty = Property & { access_codes?: { id: string; code: string; starts_at?: string; ends_at?: string }[] };
const statusMap: Record<LockStatus, { dot: string; label: string; border: string }> = {
  locked: { dot: 'text-hs-green', label: 'مغلق', border: 'border-hs-green/30' },
  unlocked: { dot: 'text-yellow-400', label: 'مفتوح', border: 'border-yellow-500/30' },
  offline: { dot: 'text-hs-red', label: 'غير متصل', border: 'border-hs-red/60' },
  unknown: { dot: 'text-hs-muted', label: 'غير معروف', border: 'border-hs-border' },
};

export default function AdminLocksPage() {
  const { data = [], isLoading, refetch } = useProperties();
  const [selected, setSelected] = useState<LockProperty | null>(null);
  const [code, setCode] = useState('');
  const [form, setForm] = useState({ startTime: '', endTime: '' });
  const [busy, setBusy] = useState<string>('');

  async function callLock(property: LockProperty, action: 'generateCode' | 'remoteUnlock' | 'getStatus') {
    if (!property.lock_id) return;
    setBusy(`${action}-${property.id}`);
    try {
      const response = await fetch('/api/locks/ttlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, lockId: property.lock_id, startTime: form.startTime, endTime: form.endTime }),
      });
      const result = await response.json().catch(() => ({}));
      if (action === 'generateCode') {
        setCode(result.code ?? result.data?.code ?? 'تم إرسال طلب التوليد');
        setSelected(property);
      }
      if (action === 'getStatus') refetch();
    } finally {
      setBusy('');
    }
  }

  const lockProperties = (data as LockProperty[]).filter((property) => property.lock_id);

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar title="الأقفال الذكية" breadcrumb={[{ label: 'العمليات' }, { label: 'الأقفال' }]} />
      <main className="space-y-6 p-6">
        <PageHeader title="لوحة الأقفال الذكية" subtitle="مراقبة حالة الأقفال وتوليد أكواد مؤقتة عبر TTLock." actions={<Button variant="ghost" onClick={() => refetch()}>تحديث عام</Button>} />
        {isLoading && <div className="rounded-xl border border-hs-border bg-hs-bg2 p-8 text-hs-muted">جاري تحميل الأقفال...</div>}
        <section className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2">
          {lockProperties.map((property) => {
            const status = statusMap[property.lock_status ?? 'unknown'];
            const codes = property.access_codes ?? [];
            return (
              <article key={property.id} className={`rounded-xl border bg-hs-bg2 p-5 shadow-sm ${status.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="font-serif text-lg font-semibold text-hs-text">{property.internal_name}</h2><p className="mt-1 text-xs text-hs-muted">Lock ID: {property.lock_id}</p></div>
                  <div className="flex flex-col items-end gap-2"><span className="text-sm"><span className={`text-xl ${status.dot}`}>●</span> {status.label}</span>{property.lock_status === 'offline' && <Badge variant="error" label="تنبيه: القفل غير متصل" />}</div>
                </div>
                {property.lock_status === 'offline' && <Link href="/admin/maintenance" className="mt-3 block rounded-lg border border-hs-red/30 bg-hs-red/10 p-3 text-sm text-hs-red hover:bg-hs-red/20">فتح بلاغ صيانة للقفل</Link>}
                <div className="mt-4 grid gap-3 rounded-lg bg-hs-bg p-3 text-sm text-hs-muted"><div>آخر حدث: مزامنة النظام الأخيرة أو حدث فتح الباب</div><div>البطارية: <span className="text-hs-primary">قيد الربط من TTLock</span></div></div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3"><Button size="sm" onClick={() => { setSelected(property); setCode(''); }}>توليد كود مؤقت</Button><Button size="sm" variant="outline" loading={busy === `remoteUnlock-${property.id}`} onClick={() => callLock(property, 'remoteUnlock')}>فتح عن بعد</Button><Button size="sm" variant="ghost" loading={busy === `getStatus-${property.id}`} onClick={() => callLock(property, 'getStatus')}>تحديث الحالة</Button></div>
                <div className="mt-4"><h3 className="mb-2 text-xs font-semibold text-hs-muted">آخر 3 أكواد دخول</h3><Table columns={[{ key: 'code', header: 'الكود' }, { key: 'starts_at', header: 'البداية', render: (row: any) => row.starts_at ? new Date(row.starts_at).toLocaleDateString('ar-SA') : '-' }, { key: 'ends_at', header: 'النهاية', render: (row: any) => row.ends_at ? new Date(row.ends_at).toLocaleDateString('ar-SA') : '-' }]} data={codes.slice(0, 3).map((item, index) => ({ ...item, id: item.id ?? `${property.id}-${index}` }))} emptyMessage="لا توجد أكواد محفوظة" /></div>
              </article>
            );
          })}
        </section>
      </main>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="توليد كود مؤقت" size="md">
        {selected && <div className="space-y-4"><p className="text-sm text-hs-muted">الوحدة: {selected.internal_name}</p><div className="grid gap-3 sm:grid-cols-2"><DatePicker label="بداية الصلاحية" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} /><DatePicker label="نهاية الصلاحية" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} /></div><Button loading={busy === `generateCode-${selected.id}`} onClick={() => callLock(selected, 'generateCode')}>توليد الكود</Button>{code && <div className="rounded-xl border border-hs-primary/30 bg-hs-primary/10 p-4"><Input readOnly value={code} label="الكود المؤقت" /><Button className="mt-3" variant="outline" onClick={() => navigator.clipboard?.writeText(code)}>نسخ الكود</Button></div>}</div>}
      </Modal>
    </div>
  );
}
