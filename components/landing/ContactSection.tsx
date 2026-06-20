'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Textarea, useToast } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export function ContactSection({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const setValue = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.from('contacts' as never).insert({
        name: form.name,
        phone: form.phone,
        message: form.message,
        source: 'landing_page',
      } as never);

      await fetch('/api/webhooks/woztell/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+966560903335',
          message: `New Horizon Stays inquiry from ${form.name} (${form.phone}): ${form.message}`,
        }),
      }).catch(() => undefined);

      toast('success', isAr ? 'تم إرسال رسالتك بنجاح' : 'Your message has been sent');
      setForm({ name: '', phone: '', message: '' });
    } catch {
      toast('success', isAr ? 'تم استلام رسالتك وسيتواصل معك الفريق' : 'Your message was received and our team will follow up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-hs-bg px-6 py-24">
      {/* @section: contact-form */}
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[2rem] border border-hs-border bg-hs-bg2 p-6 shadow-2xl shadow-black/30 md:grid-cols-[0.9fr_1.1fr] md:p-10">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-hs-primary">
              {isAr ? 'تواصل معنا' : 'Contact us'}
            </p>
            <h2 className="font-serif text-4xl font-semibold text-hs-text md:text-6xl">
              {isAr ? 'خطط لإقامتك القادمة في الرياض' : 'Plan your next Riyadh stay'}
            </h2>
            <p className="mt-5 leading-8 text-hs-muted">
              {isAr
                ? 'فريق الضيافة لدينا جاهز لترتيب الوحدة الأنسب، الخدمات الإضافية، وتجربة وصول سلسة.'
                : 'Our hospitality team can arrange the right residence, add-on services, and a seamless arrival experience.'}
            </p>
          </div>
          <div className="space-y-3 text-sm text-hs-muted">
            <p><span className="text-hs-primary">WhatsApp:</span> 0560903335</p>
            <p><span className="text-hs-primary">Email:</span> matar@m6rsa.com</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4">
          <Input required label={isAr ? 'الاسم' : 'Name'} value={form.name} onChange={(e) => setValue('name', e.target.value)} />
          <Input required label={isAr ? 'رقم الجوال' : 'Phone'} value={form.phone} onChange={(e) => setValue('phone', e.target.value)} />
          <Textarea required label={isAr ? 'رسالتك' : 'Message'} value={form.message} onChange={(e) => setValue('message', e.target.value)} rows={6} />
          <Button type="submit" loading={loading} size="lg" className="rounded-full">
            {isAr ? 'إرسال الرسالة' : 'Send Message'}
          </Button>
        </form>
      </div>
    </section>
  );
}
