'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/admin/TopBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button, Modal, Input, Textarea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface Banner {
  id: string;
  title: string;
  message: string;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

type BannerForm = {
  title: string;
  message: string;
  starts_at: string;
  ends_at: string;
};

const EMPTY_FORM: BannerForm = {
  title: '',
  message: '',
  starts_at: '',
  ends_at: '',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function BannersPage() {
  const supabase = createClient() as any;
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchBanners() {
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('banners')
        .select('id, title, message, active, starts_at, ends_at, created_at')
        .order('created_at', { ascending: false });

      if (err) {
        // table might not exist
        setTableExists(false);
        setBanners([]);
      } else {
        setTableExists(true);
        setBanners(data ?? []);
      }
    } catch {
      setTableExists(false);
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  async function toggleActive(id: string, current: boolean) {
    setTogglingId(id);
    const { error: err } = await supabase
      .from('banners')
      .update({ active: !current })
      .eq('id', id);
    if (!err) {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !current } : b))
      );
    }
    setTogglingId(null);
  }

  async function saveBanner() {
    if (!form.title.trim() || !form.message.trim()) {
      setError('العنوان والرسالة مطلوبان');
      return;
    }
    setSaving(true);
    setError(null);
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      message: form.message.trim(),
      active: true,
    };
    if (form.starts_at) payload.starts_at = form.starts_at;
    if (form.ends_at) payload.ends_at = form.ends_at;

    const { error: err } = await supabase.from('banners').insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message ?? 'فشل الحفظ');
    } else {
      setAddOpen(false);
      setForm(EMPTY_FORM);
      fetchBanners();
    }
  }

  async function deleteBanner(id: string) {
    await supabase.from('banners').delete().eq('id', id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
    setDeleteConfirmId(null);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar
        title="البانرات"
        breadcrumb={[
          { label: 'الرئيسية', href: '/admin' },
          { label: 'البانرات' },
        ]}
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            + بانر جديد
          </Button>
        }
      />
      <main className="space-y-6 p-6">
        <PageHeader
          title="إعلانات الموقع"
          subtitle="أضف وأدِر البانرات الإعلانية التي تظهر للزوار على الموقع"
        />

        {/* Table-not-exists warning */}
        {!tableExists && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-300">
            ⚠️ جدول <code className="font-mono text-xs">banners</code> غير موجود بعد في قاعدة البيانات. يمكنك إنشاؤه من SQL Editor في Supabase:
            <pre className="mt-2 bg-hs-bg rounded p-3 text-xs text-hs-muted overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  starts_at DATE,
  ends_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);`}
            </pre>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-hs-muted text-sm">
            جاري التحميل…
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-xl border border-hs-border bg-hs-bg2 p-16 text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-hs-muted/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
            <p className="text-hs-muted text-sm">لا توجد بانرات</p>
            <p className="mt-2">
              <Button size="sm" onClick={() => setAddOpen(true)}>
                أضف أول بانر
              </Button>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`rounded-xl border bg-hs-bg2 p-4 transition-all ${
                  banner.active ? 'border-hs-primary/30' : 'border-hs-border opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-hs-text text-sm">
                        {banner.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          banner.active
                            ? 'bg-green-500/15 text-green-400 border-green-500/30'
                            : 'bg-hs-muted/10 text-hs-muted border-hs-border'
                        }`}
                      >
                        {banner.active ? 'نشط' : 'معطّل'}
                      </span>
                    </div>
                    <p className="text-sm text-hs-muted line-clamp-2">
                      {banner.message}
                    </p>
                    {(banner.starts_at || banner.ends_at) && (
                      <p className="text-xs text-hs-muted/60 mt-1.5">
                        {banner.starts_at && `من ${formatDate(banner.starts_at)}`}
                        {banner.starts_at && banner.ends_at && ' ← '}
                        {banner.ends_at && `حتى ${formatDate(banner.ends_at)}`}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(banner.id, banner.active)}
                      disabled={togglingId === banner.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                        banner.active ? 'bg-hs-primary' : 'bg-hs-muted/30'
                      }`}
                      title={banner.active ? 'إيقاف' : 'تفعيل'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          banner.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(banner.id)}
                      className="p-1.5 rounded-lg text-hs-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="حذف"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Banner Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setForm(EMPTY_FORM); setError(null); }} title="بانر جديد" size="lg">
        <div className="grid gap-4">
          <Input
            label="العنوان *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="مثال: عروض الصيف 2026"
          />
          <Textarea
            label="نص الرسالة *"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="أدخل نص الإعلان الذي سيظهر للزوار…"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-hs-muted">تاريخ البدء</label>
              <input
                type="date"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="bg-hs-bg border border-hs-border rounded-lg px-3 py-2 text-sm text-hs-text focus:outline-none focus:border-hs-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-hs-muted">تاريخ الانتهاء</label>
              <input
                type="date"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className="bg-hs-bg border border-hs-border rounded-lg px-3 py-2 text-sm text-hs-text focus:outline-none focus:border-hs-primary transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => { setAddOpen(false); setForm(EMPTY_FORM); setError(null); }}
            >
              إلغاء
            </Button>
            <Button onClick={saveBanner} disabled={saving}>
              {saving ? 'جاري الحفظ…' : 'حفظ البانر'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-hs-muted">
            هل أنت متأكد من حذف هذا البانر؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmId && deleteBanner(deleteConfirmId)}
            >
              حذف نهائياً
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
