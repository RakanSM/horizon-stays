'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/admin/TopBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

type CleanStatus = 'pending' | 'in_progress' | 'done';

interface CleaningTask {
  id: string;
  guest_name: string;
  check_out: string;
  property_id: string;
  property_name: string;
  unit_type: string | null;
  status: CleanStatus;
}

const COLUMNS: { key: CleanStatus; label: string; sub: string; color: string; dot: string }[] = [
  {
    key: 'pending',
    label: 'قيد الانتظار',
    sub: 'Pending',
    color: 'border-yellow-500/30 bg-yellow-500/5',
    dot: 'bg-yellow-400',
  },
  {
    key: 'in_progress',
    label: 'جارٍ',
    sub: 'In Progress',
    color: 'border-blue-500/30 bg-blue-500/5',
    dot: 'bg-blue-400',
  },
  {
    key: 'done',
    label: 'مكتمل',
    sub: 'Done',
    color: 'border-green-500/30 bg-green-500/5',
    dot: 'bg-green-400',
  },
];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
}

function isPastCheckout(dateStr: string): boolean {
  return new Date(dateStr) <= new Date();
}

export default function CleaningPage() {
  const supabase = createClient() as any;
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase
          .from('bookings')
          .select(
            'id, guest_name, check_out, property_id, properties:property_id(internal_name, unit_type)'
          )
          .gte('check_out', today)
          .in('status', ['confirmed', 'checked_in', 'checked_out'])
          .order('check_out', { ascending: true });

        const rows: CleaningTask[] = (data ?? []).map((b: any) => ({
          id: b.id,
          guest_name: b.guest_name ?? 'ضيف',
          check_out: b.check_out,
          property_id: b.property_id,
          property_name:
            b.properties?.internal_name ?? b.property_id?.slice(0, 8) ?? '—',
          unit_type: b.properties?.unit_type ?? null,
          status: 'pending' as CleanStatus,
        }));
        setTasks(rows);
      } catch {
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function moveTask(id: string, newStatus: CleanStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  }

  const totalByStatus = (status: CleanStatus) =>
    tasks.filter((t) => t.status === status).length;

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar
        title="جدول التنظيف"
        breadcrumb={[
          { label: 'الرئيسية', href: '/admin' },
          { label: 'التنظيف' },
        ]}
      />
      <main className="space-y-6 p-6">
        <PageHeader
          title="كانبان التنظيف"
          subtitle="تتبع مهام التنظيف لكل وحدة بعد مغادرة الضيف"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-hs-muted text-sm">
            جاري التحميل…
          </div>
        ) : tasks.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-hs-muted text-sm">لا توجد مهام تنظيف قادمة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div
                  key={col.key}
                  className={`rounded-xl border ${col.color} p-4 space-y-3 min-h-[200px]`}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <div>
                        <span className="font-semibold text-sm text-hs-text">
                          {col.label}
                        </span>
                        <span className="text-hs-muted text-xs mr-1.5">
                          / {col.sub}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-hs-bg2 border border-hs-border rounded-full px-2 py-0.5 text-hs-muted">
                      {totalByStatus(col.key)}
                    </span>
                  </div>

                  {/* Cards */}
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8 text-hs-muted/50 text-xs">
                      لا توجد مهام
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg border border-hs-border bg-hs-bg2 p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-hs-primary truncate">
                              {task.property_name}
                            </p>
                            {task.unit_type && (
                              <p className="text-[10px] text-hs-muted">
                                {task.unit_type}
                              </p>
                            )}
                          </div>
                          {isPastCheckout(task.check_out) ? (
                            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/20">
                              متأخر
                            </span>
                          ) : (
                            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-hs-bg border border-hs-border text-hs-muted">
                              خروج {formatDate(task.check_out)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-hs-muted truncate">
                          الضيف: {task.guest_name}
                        </p>

                        {/* Move buttons */}
                        <div className="flex gap-1.5 pt-1 flex-wrap">
                          {col.key !== 'pending' && (
                            <button
                              onClick={() => moveTask(task.id, 'pending')}
                              className="text-[10px] px-2 py-0.5 rounded border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                            >
                              ← انتظار
                            </button>
                          )}
                          {col.key !== 'in_progress' && (
                            <button
                              onClick={() => moveTask(task.id, 'in_progress')}
                              className="text-[10px] px-2 py-0.5 rounded border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors"
                            >
                              {col.key === 'pending' ? 'ابدأ →' : '← ارجع'}
                            </button>
                          )}
                          {col.key !== 'done' && (
                            <button
                              onClick={() => moveTask(task.id, 'done')}
                              className="text-[10px] px-2 py-0.5 rounded border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors"
                            >
                              مكتمل ✓
                            </button>
                          )}
                          <button
                            disabled
                            className="text-[10px] px-2 py-0.5 rounded border border-hs-border text-hs-muted/40 cursor-not-allowed"
                            title="سيُفعَّل لاحقاً"
                          >
                            تعيين
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary bar */}
        {!isLoading && tasks.length > 0 && (
          <div className="rounded-xl border border-hs-border bg-hs-bg2 p-4 flex flex-wrap gap-6 text-sm">
            <span className="text-hs-muted">
              الإجمالي:{' '}
              <strong className="text-hs-text">{tasks.length}</strong> مهمة
            </span>
            <span className="text-yellow-400">
              انتظار: <strong>{totalByStatus('pending')}</strong>
            </span>
            <span className="text-blue-400">
              جارٍ: <strong>{totalByStatus('in_progress')}</strong>
            </span>
            <span className="text-green-400">
              مكتمل: <strong>{totalByStatus('done')}</strong>
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
