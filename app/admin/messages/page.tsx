'use client';

import { useEffect, useState, useCallback } from 'react';
import { TopBar } from '@/components/admin/TopBar';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface ContactMessage {
  id: string;
  name: string;
  phone: string | null;
  message: string;
  created_at: string;
  read: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function MessagesPage() {
  const supabase = createClient() as any;
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('contacts')
        .select('id, name, phone, message, created_at, read')
        .order('created_at', { ascending: false });
      setMessages(data ?? []);
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();

    // Realtime subscription for new contacts
    const channel = supabase
      .channel('contacts-inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contacts' },
        (payload: { new: ContactMessage }) => {
          setMessages((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contacts' },
        (payload: { new: ContactMessage }) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  async function markAsRead(id: string) {
    setMarkingId(id);
    await supabase.from('contacts').update({ read: true }).eq('id', id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    );
    setMarkingId(null);
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div dir="rtl" className="min-h-screen bg-hs-bg text-hs-text">
      <TopBar
        title="الرسائل"
        breadcrumb={[
          { label: 'الرئيسية', href: '/admin' },
          { label: 'الرسائل' },
        ]}
        actions={
          unreadCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-hs-primary/20 text-hs-primary text-xs font-semibold border border-hs-primary/30">
              {unreadCount} غير مقروءة
            </span>
          ) : undefined
        }
      />
      <main className="space-y-6 p-6">
        <PageHeader
          title="صندوق الرسائل"
          subtitle="رسائل الضيوف والزوار الواردة عبر نموذج التواصل"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-hs-muted text-sm">
            جاري التحميل…
          </div>
        ) : messages.length === 0 ? (
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z"
              />
            </svg>
            <p className="text-hs-muted text-sm">لا توجد رسائل</p>
            <p className="text-hs-muted/60 text-xs mt-1">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border bg-hs-bg2 transition-all cursor-pointer ${
                  msg.read
                    ? 'border-hs-border'
                    : 'border-hs-primary/40 shadow-sm shadow-hs-primary/10'
                }`}
                onClick={() =>
                  setExpandedId(expandedId === msg.id ? null : msg.id)
                }
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-hs-primary/20 border border-hs-primary/30 flex items-center justify-center text-hs-primary font-semibold text-sm select-none">
                    {initials(msg.name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-hs-text text-sm">
                        {msg.name}
                      </span>
                      {msg.phone && (
                        <span className="text-hs-muted text-xs">
                          {msg.phone}
                        </span>
                      )}
                      {!msg.read && (
                        <span className="px-1.5 py-0.5 rounded-full bg-hs-primary text-hs-bg text-[10px] font-bold">
                          جديد
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-sm text-hs-muted ${
                        expandedId === msg.id ? '' : 'truncate'
                      }`}
                    >
                      {msg.message}
                    </p>

                    {/* Expanded area */}
                    {expandedId === msg.id && (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-lg bg-hs-bg border border-hs-border p-3 text-sm text-hs-text leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </div>
                        {!msg.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(msg.id);
                            }}
                            disabled={markingId === msg.id}
                          >
                            {markingId === msg.id
                              ? 'جاري التحديث…'
                              : '✓ تمييز كمقروءة'}
                          </Button>
                        )}
                        {msg.phone && (
                          <a
                            href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            واتساب
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-xs text-hs-muted mt-0.5 whitespace-nowrap">
                    {timeAgo(msg.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
