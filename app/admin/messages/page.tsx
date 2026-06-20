'use client';
import { TopBar } from '@/components/admin/TopBar';

export default function MessagesPage() {
  return (
    <div dir="rtl">
      <TopBar title="الرسائل" breadcrumb={[{ label: 'الرئيسية', href: '/admin' }, { label: 'الرسائل' }]} />
      <div className="p-6">
        <div className="bg-hs-bg2 border border-hs-border rounded-xl p-10 text-center text-hs-muted">
          قيد التطوير — سيتم استكماله قريباً
        </div>
      </div>
    </div>
  );
}
