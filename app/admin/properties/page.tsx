'use client';
import { useState } from 'react';
import { TopBar } from '@/components/admin/TopBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyOwners } from '@/hooks/usePropertyOwners';
import { formatCurrency } from '@/lib/utils';
import type { Property } from '@/types';

export default function PropertiesPage() {
  const { data: properties, isLoading } = useProperties();
  const { data: owners } = usePropertyOwners();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editTab, setEditTab] = useState('overview');

  const statusLabel: Record<string, string> = { available: 'متاح', occupied: 'مشغول', maintenance: 'صيانة', blocked: 'مقيّد' };
  const statusVariant: Record<string, string> = { available: 'confirmed', occupied: 'checked_in', maintenance: 'high', blocked: 'cancelled' };

  return (
    <div dir="rtl">
      <TopBar title="الوحدات" breadcrumb={[{ label: 'الرئيسية', href: '/admin' }, { label: 'الوحدات' }]}
        actions={<Button size="sm">+ وحدة جديدة</Button>} />
      <div className="p-6">
        {isLoading ? (
          <div className="text-center text-hs-muted py-20">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(properties ?? []).map(prop => (
              <div key={prop.id} className="bg-hs-bg2 border border-hs-border rounded-xl overflow-hidden hover:border-hs-primary/40 transition-colors cursor-pointer" onClick={() => setSelectedProperty(prop)}>
                <div className="h-40 bg-gradient-to-br from-hs-bg3 to-hs-bg2 flex items-center justify-center">
                  <span className="text-4xl opacity-30">🏢</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-semibold text-hs-text">{prop.internal_name}</h3>
                    <Badge variant={statusVariant[prop.status] as any} label={statusLabel[prop.status]} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-hs-muted bg-hs-bg3 rounded px-2 py-0.5 capitalize">{prop.type}</span>
                    <span className="text-xs text-hs-muted bg-hs-bg3 rounded px-2 py-0.5">{prop.bedrooms ?? 0} غرف</span>
                    <span className="text-xs text-hs-muted bg-hs-bg3 rounded px-2 py-0.5">{prop.area_sqm ?? 0} م²</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-hs-border">
                    <span className="text-hs-primary font-bold font-serif">{formatCurrency(prop.base_price_night)}<span className="text-hs-muted text-xs font-normal">/ليلة</span></span>
                    <span className={`flex items-center gap-1.5 text-xs ${prop.lock_status === 'locked' ? 'text-hs-green' : prop.lock_status === 'unlocked' ? 'text-yellow-400' : 'text-hs-red'}`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {prop.lock_status === 'locked' ? 'مقفل' : prop.lock_status === 'unlocked' ? 'مفتوح' : 'غير متصل'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selectedProperty} onClose={() => setSelectedProperty(null)} title={selectedProperty?.internal_name ?? ''} size="xl">
        {selectedProperty && (
          <div>
            <Tabs tabs={[
              { key: 'overview', label: 'نظرة عامة' },
              { key: 'ownership', label: 'الملكية' },
              { key: 'platforms', label: 'المنصات' },
              { key: 'financials', label: 'المالية' },
            ]} active={editTab} onChange={setEditTab} className="mb-6" />
            
            {editTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="اسم الوحدة" defaultValue={selectedProperty.internal_name} />
                <Select label="النوع" defaultValue={selectedProperty.type}
                  options={[{value:'penthouse',label:'بنتهاوس'},{value:'suite',label:'سويت'},{value:'loft',label:'لوفت'},{value:'studio',label:'استوديو'}]} />
                <Input label="المساحة (م²)" type="number" defaultValue={String(selectedProperty.area_sqm ?? '')} />
                <Input label="غرف النوم" type="number" defaultValue={String(selectedProperty.bedrooms ?? '')} />
                <Input label="الحمامات" type="number" defaultValue={String(selectedProperty.bathrooms ?? '')} />
                <Input label="الطابق" type="number" defaultValue={String(selectedProperty.floor ?? '')} />
                <Input label="السعر/ليلة (ريال)" type="number" defaultValue={String(selectedProperty.base_price_night)} className="col-span-2" />
                <div className="col-span-2 flex gap-3">
                  <Button>حفظ التغييرات</Button>
                  <Button variant="ghost">إلغاء</Button>
                </div>
              </div>
            )}

            {editTab === 'ownership' && (
              <div className="flex flex-col gap-4">
                <Select label="نوع الوحدة" defaultValue={selectedProperty.property_type}
                  options={[{value:'owned',label:'مملوكة للمؤسسة'},{value:'third_party_managed',label:'تشغيل للغير'}]} />
                {selectedProperty.property_type === 'third_party_managed' && (
                  <>
                    <Select label="المالك" defaultValue={selectedProperty.owner_id ?? ''}
                      options={(owners ?? []).map(o => ({ value: o.id, label: o.owner_name }))} placeholder="اختر مالك" />
                    <Input label="نسبة عمولة الإدارة (%)" type="number" defaultValue="15" />
                  </>
                )}
                <Button>حفظ</Button>
              </div>
            )}

            {editTab === 'platforms' && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-hs-muted">أسماء الوحدة على كل منصة:</p>
                {['airbnb', 'booking', 'gatherin', 'expedia'].map(p => (
                  <div key={p} className="grid grid-cols-2 gap-3">
                    <Input label={`اسم على ${p}`} defaultValue={selectedProperty.platform_names?.[p]?.name ?? ''} />
                    <Input label="رابط الإعلان" defaultValue={selectedProperty.platform_names?.[p]?.url ?? ''} />
                  </div>
                ))}
                <Button>حفظ أسماء المنصات</Button>
              </div>
            )}

            {editTab === 'financials' && (
              <div className="text-center py-8 text-hs-muted text-sm">
                تقارير مالية مفصلة متاحة في قسم المالية
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
