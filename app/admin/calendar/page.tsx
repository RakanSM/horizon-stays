'use client';
import { useState } from 'react';
import { TopBar } from '@/components/admin/TopBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { PlatformBadge } from '@/components/ui/Badge';
import { useBookings } from '@/hooks/useBookings';
import { useBlockedDays } from '@/hooks/useBlockedDays';
import { useProperties } from '@/hooks/useProperties';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO, isWithinInterval } from 'date-fns';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';

const PLATFORM_COLORS: Record<string, string> = {
  airbnb: '#FF5A5F', booking: '#4a90d9', gatherin: '#c9a96e',
  expedia: '#1d4e89', direct: '#c9a96e', manual: '#60a5fa', blocked: '#a78bfa',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({ property_id: '', start_date: '', end_date: '', reason: '' });

  const { data: bookings } = useBookings();
  const { data: blockedDays } = useBlockedDays();
  const { data: properties } = useProperties();

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const monthStart = startOfMonth(currentDate);
  const firstDayOfWeek = monthStart.getDay();

  function getBookingsForDay(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    return (bookings ?? []).filter(b => b.status !== 'cancelled' && b.check_in <= dateStr && b.check_out > dateStr);
  }

  function getBlockedForDay(date: Date) {
    return (blockedDays ?? []).filter(bd => {
      try {
        return isWithinInterval(date, { start: parseISO(bd.start_date), end: parseISO(bd.end_date) }) && bd.status === 'approved';
      } catch { return false; }
    });
  }

  async function handleBlock() {
    await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...blockForm, type: 'blocked_day' }) });
    setBlockModalOpen(false);
  }

  const weekDays = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'];

  return (
    <div dir="rtl">
      <TopBar title="التقويم" breadcrumb={[{ label: 'الرئيسية', href: '/admin' }, { label: 'التقويم' }]}
        actions={<Button size="sm" onClick={() => setBlockModalOpen(true)}>تقييد أيام</Button>} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
            className="p-2 hover:bg-hs-bg3 rounded-lg text-hs-muted hover:text-hs-text transition-colors">‹</button>
          <h2 className="text-lg font-serif font-semibold text-hs-text">
            {currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
            className="p-2 hover:bg-hs-bg3 rounded-lg text-hs-muted hover:text-hs-text transition-colors">›</button>
        </div>
        <div className="flex gap-4 mb-4 flex-wrap">
          {Object.entries(PLATFORM_COLORS).map(([p, c]) => (
            <span key={p} className="flex items-center gap-1.5 text-xs text-hs-muted">
              <span className="w-3 h-3 rounded-sm" style={{ background: c }} />{p}
            </span>
          ))}
        </div>
        <div className="bg-hs-bg2 border border-hs-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-hs-border">
            {weekDays.map(d => <div key={d} className="text-center text-xs text-hs-muted py-2 font-medium">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} className="border-b border-e border-hs-border/30 min-h-[80px]" />)}
            {days.map(day => {
              const dayBookings = getBookingsForDay(day);
              const dayBlocked = getBlockedForDay(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div key={day.toISOString()} className={cn('border-b border-e border-hs-border/30 min-h-[80px] p-1.5 hover:bg-hs-bg3/50 transition-colors', isToday && 'bg-hs-primary/5')}>
                  <span className={cn('text-xs font-medium mb-1 block', isToday ? 'text-hs-primary' : 'text-hs-muted')}>{format(day, 'd')}</span>
                  <div className="flex flex-col gap-0.5">
                    {dayBlocked.map((bd, i) => (
                      <div key={`${bd.id}-${i}`} className="text-xs px-1 py-0.5 rounded text-white truncate" style={{ background: PLATFORM_COLORS.blocked }}>
                        مقيّد
                      </div>
                    ))}
                    {dayBookings.slice(0, 2).map(b => (
                      <button key={b.id} onClick={() => setSelectedBooking(b)}
                        className="text-xs px-1 py-0.5 rounded text-white truncate text-right w-full hover:opacity-80 transition-opacity"
                        style={{ background: PLATFORM_COLORS[b.platform] ?? '#c9a96e' }}>
                        {b.guest_name.split(' ')[0]}
                      </button>
                    ))}
                    {dayBookings.length > 2 && <span className="text-xs text-hs-muted">+{dayBookings.length - 2}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="تفاصيل الحجز" size="sm">
        {selectedBooking && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-hs-muted">الضيف</span><span className="text-hs-text font-medium">{selectedBooking.guest_name}</span></div>
            <div className="flex items-center justify-between"><span className="text-hs-muted">الجوال</span><span className="text-hs-text">{selectedBooking.guest_phone}</span></div>
            <div className="flex items-center justify-between"><span className="text-hs-muted">المبلغ</span><span className="text-hs-primary font-bold">{selectedBooking.amount_sar.toLocaleString()} ريال</span></div>
            <div className="flex items-center justify-between"><span className="text-hs-muted">المنصة</span><PlatformBadge platform={selectedBooking.platform} /></div>
            <div className="flex items-center justify-between"><span className="text-hs-muted">تسجيل الدخول</span><span className="text-hs-text">{selectedBooking.check_in}</span></div>
            <div className="flex items-center justify-between"><span className="text-hs-muted">تسجيل الخروج</span><span className="text-hs-text">{selectedBooking.check_out}</span></div>
          </div>
        )}
      </Modal>

      <Modal open={blockModalOpen} onClose={() => setBlockModalOpen(false)} title="تقييد أيام">
        <div className="flex flex-col gap-4">
          <Select label="الوحدة" value={blockForm.property_id} onChange={e => setBlockForm(f => ({ ...f, property_id: e.target.value }))}
            options={(properties ?? []).map(p => ({ value: p.id, label: p.internal_name }))} placeholder="اختر وحدة" />
          <DatePicker label="من" value={blockForm.start_date} onChange={e => setBlockForm(f => ({ ...f, start_date: e.target.value }))} />
          <DatePicker label="إلى" value={blockForm.end_date} onChange={e => setBlockForm(f => ({ ...f, end_date: e.target.value }))} />
          <Input label="السبب" value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} placeholder="صيانة، حجز خاص..." />
          <Button onClick={handleBlock}>تقييد الأيام</Button>
        </div>
      </Modal>
    </div>
  );
}
