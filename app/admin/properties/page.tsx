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

export default function EnhancedPropertiesPage() {
  const { data: properties, isLoading, refetch } = useProperties();
  const { data: owners } = usePropertyOwners();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editTab, setEditTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const statusLabel: Record<string, string> = { available: 'متاح', occupied: 'مشغول', maintenance: 'صيانة', blocked: 'مقيّد' };
  const statusVariant: Record<string, string> = { available: 'confirmed', occupied: 'checked_in', maintenance: 'high', blocked: 'cancelled' };

  const handlePropertySelect = (prop: Property) => {
    setSelectedProperty(prop);
    setFormData({
      id: prop.id,
      internal_name: prop.internal_name,
      type: prop.type,
      area_sqm: prop.area_sqm,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      floor: prop.floor,
      base_price_night: prop.base_price_night,
      status: prop.status,
      description: prop.description || '',
      airbnb_ical_url: prop.airbnb_ical_url || '',
      gatherin_ical_url: prop.gatherin_ical_url || '',
      property_type: prop.property_type,
      owner_id: prop.owner_id,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      await refetch();
      setSelectedProperty(null);
      alert('تم حفظ التغييرات بنجاح');
    } catch (error) {
      alert('حدث خطأ: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedProperty) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/properties/booking-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: selectedProperty.id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await refetch();
      setFormData({ ...formData, status: newStatus });
      alert('تم تحديث الحالة بنجاح');
    } catch (error) {
      alert('حدث خطأ: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div dir="rtl">
      <TopBar 
        title="إدارة الوحدات" 
        breadcrumb={[{ label: 'الرئيسية', href: '/admin' }, { label: 'الوحدات' }]}
        actions={<Button size="sm">+ وحدة جديدة</Button>} 
      />
      <div className="p-6">
        {isLoading ? (
          <div className="text-center text-hs-muted py-20">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(properties ?? []).map(prop => (
              <div 
                key={prop.id} 
                className="bg-hs-bg2 border border-hs-border rounded-xl overflow-hidden hover:border-hs-primary/40 transition-colors cursor-pointer" 
                onClick={() => handlePropertySelect(prop)}
              >
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
              { key: 'pricing', label: 'الأسعار' },
              { key: 'ical', label: 'روابط التقويم' },
              { key: 'description', label: 'الوصف' },
              { key: 'ownership', label: 'الملكية' },
            ]} active={editTab} onChange={setEditTab} className="mb-6" />
            
            {editTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="اسم الوحدة" 
                  value={formData.internal_name} 
                  onChange={(e) => setFormData({ ...formData, internal_name: e.target.value })}
                />
                <Select 
                  label="النوع" 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={[{value:'penthouse',label:'بنتهاوس'},{value:'suite',label:'سويت'},{value:'loft',label:'لوفت'},{value:'studio',label:'استوديو'}]} 
                />
                <Input 
                  label="المساحة (م²)" 
                  type="number" 
                  value={formData.area_sqm}
                  onChange={(e) => setFormData({ ...formData, area_sqm: parseFloat(e.target.value) })}
                />
                <Input 
                  label="غرف النوم" 
                  type="number" 
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                />
                <Input 
                  label="الحمامات" 
                  type="number" 
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                />
                <Input 
                  label="الطابق" 
                  type="number" 
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                />
                <Select 
                  label="حالة الحجز" 
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  options={[
                    {value:'available',label:'متاح'},
                    {value:'occupied',label:'مشغول'},
                    {value:'maintenance',label:'صيانة'},
                    {value:'blocked',label:'مقيّد'}
                  ]} 
                />
                <div className="col-span-2 flex gap-3">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedProperty(null)}>إلغاء</Button>
                </div>
              </div>
            )}

            {editTab === 'pricing' && (
              <div className="flex flex-col gap-4">
                <Input 
                  label="السعر/ليلة (ريال)" 
                  type="number" 
                  value={formData.base_price_night}
                  onChange={(e) => setFormData({ ...formData, base_price_night: parseFloat(e.target.value) })}
                />
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'جاري الحفظ...' : 'حفظ السعر'}
                </Button>
              </div>
            )}

            {editTab === 'ical' && (
              <div className="flex flex-col gap-4">
                <Input 
                  label="رابط Airbnb iCal" 
                  value={formData.airbnb_ical_url}
                  onChange={(e) => setFormData({ ...formData, airbnb_ical_url: e.target.value })}
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                />
                <Input 
                  label="رابط Gatherin iCal" 
                  value={formData.gatherin_ical_url}
                  onChange={(e) => setFormData({ ...formData, gatherin_ical_url: e.target.value })}
                  placeholder="https://gatherin.com/calendar/ical/..."
                />
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'جاري الحفظ...' : 'حفظ روابط التقويم'}
                </Button>
              </div>
            )}

            {editTab === 'description' && (
              <div className="flex flex-col gap-4">
                <textarea 
                  className="w-full p-3 border border-hs-border rounded-lg bg-hs-bg3 text-hs-text focus:outline-none focus:border-hs-primary"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف الوحدة..."
                />
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'جاري الحفظ...' : 'حفظ الوصف'}
                </Button>
              </div>
            )}

            {editTab === 'ownership' && (
              <div className="flex flex-col gap-4">
                <Select 
                  label="نوع الوحدة" 
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  options={[{value:'owned',label:'مملوكة للمؤسسة'},{value:'third_party_managed',label:'تشغيل للغير'}]} 
                />
                {formData.property_type === 'third_party_managed' && (
                  <>
                    <Select 
                      label="المالك" 
                      value={formData.owner_id ?? ''}
                      onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                      options={(owners ?? []).map(o => ({ value: o.id, label: o.owner_name }))} 
                      placeholder="اختر مالك" 
                    />
                  </>
                )}
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
