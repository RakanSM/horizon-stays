'use client';
import { useState } from 'react';
import { TopBar } from '@/components/admin/TopBar';
import { Table } from '@/components/ui/Table';
import { Badge, PlatformBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useBookings } from '@/hooks/useBookings';
import { useProperties } from '@/hooks/useProperties';
import { formatCurrency } from '@/lib/utils';
import type { Booking, BookingStatus, Platform } from '@/types';

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [platformFilter, setPlatformFilter] = useState<Platform | ''>('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data: bookings, isLoading } = useBookings({
    status: statusFilter || undefined,
    platform: platformFilter || undefined,
    propertyId: propertyFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const { data: properties } = useProperties();

  const statusLabel: Record<string, string> = {
    pending: 'معلق', confirmed: 'مؤكد', checked_in: 'داخل', checked_out: 'خرج', cancelled: 'ملغي', transferred: 'محوّل',
  };

  const columns = [
    { key: 'guest_name', header: 'الضيف' },
    { key: 'guest_phone', header: 'الجوال' },
    { key: 'platform', header: 'المنصة', render: (b: Booking) => <PlatformBadge platform={b.platform} /> },
    { key: 'property', header: 'الوحدة', render: (b: Booking) => <span className="text-hs-primary text-xs">{b.property?.internal_name ?? '—'}</span> },
    { key: 'check_in', header: 'الدخول', render: (b: Booking) => <span className="text-xs">{b.check_in}</span> },
    { key: 'check_out', header: 'الخروج', render: (b: Booking) => <span className="text-xs">{b.check_out}</span> },
    { key: 'nights', header: 'ليالٍ' },
    { key: 'amount_sar', header: 'المبلغ', render: (b: Booking) => <span className="text-hs-primary font-semibold">{formatCurrency(b.amount_sar)}</span> },
    { key: 'status', header: 'الحالة', render: (b: Booking) => <Badge variant={b.status as any} label={statusLabel[b.status] ?? b.status} /> },
    { key: 'actions', header: 'إجراءات', render: (b: Booking) => (
      <div className="flex gap-1">
        {b.status === 'pending' && <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); handleApprove(b.id); }}>قبول</Button>}
        {b.status === 'pending' && <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }}>رفض</Button>}
      </div>
    )},
  ];

  async function handleApprove(id: string) {
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) });
  }

  async function handleCancel(id: string) {
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
  }

  return (
    <div dir="rtl">
      <TopBar title="الحجوزات" breadcrumb={[{ label: 'الرئيسية', href: '/admin' }, { label: 'الحجوزات' }]}
        actions={<Button size="sm" onClick={() => setAddModalOpen(true)}>+ حجز جديد</Button>} />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-3 bg-hs-bg2 border border-hs-border rounded-xl p-4">
          <Select placeholder="كل الحالات" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            options={[{value:'pending',label:'معلق'},{value:'confirmed',label:'مؤكد'},{value:'checked_in',label:'داخل'},{value:'cancelled',label:'ملغي'}]} className="w-36" />
          <Select placeholder="كل المنصات" value={platformFilter} onChange={e => setPlatformFilter(e.target.value as any)}
            options={[{value:'airbnb',label:'Airbnb'},{value:'booking',label:'Booking'},{value:'gatherin',label:'Gatherin'},{value:'expedia',label:'Expedia'},{value:'direct',label:'مباشر'}]} className="w-36" />
          <Select placeholder="كل الوحدات" value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)}
            options={(properties ?? []).map(p => ({ value: p.id, label: p.internal_name }))} className="w-40" />
          <DatePicker value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36" />
          <DatePicker value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36" />
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setPlatformFilter(''); setPropertyFilter(''); setDateFrom(''); setDateTo(''); }}>مسح</Button>
        </div>
        <Table columns={columns} data={bookings ?? []} loading={isLoading} onRowClick={setSelectedBooking} emptyMessage="لا توجد حجوزات" />
      </div>

      <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="تفاصيل الحجز" size="lg">
        {selectedBooking && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['الضيف', selectedBooking.guest_name],
              ['الجوال', selectedBooking.guest_phone],
              ['البريد', selectedBooking.guest_email],
              ['المنصة', selectedBooking.platform],
              ['الدخول', selectedBooking.check_in],
              ['الخروج', selectedBooking.check_out],
              ['الليالي', selectedBooking.nights],
              ['المبلغ', formatCurrency(selectedBooking.amount_sar)],
              ['حالة الحجز', selectedBooking.status],
              ['حالة الدفع', selectedBooking.payment_status],
              ['كود الباب', selectedBooking.door_code ?? '—'],
              ['ملاحظات', selectedBooking.notes ?? '—'],
            ].map(([label, val], i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-hs-muted text-xs uppercase">{label}</span>
                <span className="text-hs-text">{String(val ?? '—')}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="حجز جديد" size="lg">
        <div className="text-center py-8 text-hs-muted text-sm">نموذج إضافة الحجز سيتم استكماله في مرحلة لاحقة</div>
      </Modal>
    </div>
  );
}
