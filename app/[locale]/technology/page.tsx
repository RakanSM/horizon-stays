'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TechnologyPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const features = [
    {
      title: isAr ? 'إدارة ذكية للإيجار' : 'Smart Rental Management',
      description: isAr
        ? 'نظام متكامل يربط حجوزاتك مباشرة بـ Odoo ERP لضمان دقة العمليات.'
        : 'A seamless system connecting your bookings directly to Odoo ERP for operational precision.',
      icon: '🏢',
    },
    {
      title: isAr ? 'أتمتة الفواتير' : 'Automated Invoicing',
      description: isAr
        ? 'يتم إصدار الفواتير المالية فوراً وبشكل آلي لضمان الشفافية والسرعة.'
        : 'Financial invoices are issued instantly and automatically to ensure transparency and speed.',
      icon: '🧾',
    },
    {
      title: isAr ? 'محاسبة دقيقة' : 'Precise Accounting',
      description: isAr
        ? 'تكامل مالي كامل يتتبع كل معاملة بدقة متناهية وفقاً لأعلى المعايير.'
        : 'Full financial integration tracking every transaction with extreme accuracy per the highest standards.',
      icon: '📊',
    },
    {
      title: isAr ? 'تتبع النفقات' : 'Expense Tracking',
      description: isAr
        ? 'نظام ذكي لمراقبة نفقات الصيانة والتشغيل لضمان جودة الوحدات.'
        : 'A smart system to monitor maintenance and operational expenses to ensure unit quality.',
      icon: '💰',
    },
    {
      title: isAr ? 'توقيع رقمي آمن' : 'Secure Digital Signatures',
      description: isAr
        ? 'عقود إيجار رقمية موثقة تضمن حقوق جميع الأطراف بكل سهولة.'
        : 'Documented digital rental contracts ensuring the rights of all parties with ease.',
      icon: '✍️',
    },
    {
      title: isAr ? 'تقارير فورية' : 'Real-time Reporting',
      description: isAr
        ? 'لوحات بيانات متقدمة توفر رؤية شاملة لأداء العقارات والنمو المالي.'
        : 'Advanced dashboards providing a comprehensive view of property performance and financial growth.',
      icon: '📈',
    },
  ];

  return (
    <div className="min-h-screen bg-hs-bg text-hs-text pt-32 pb-20 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="font-serif text-5xl md:text-7xl font-semibold mb-6 leading-tight">
            {isAr ? (
              <>
                التكنولوجيا في خدمة <br />
                <span className="text-hs-primary italic">الفخامة</span>
              </>
            ) : (
              <>
                Technology Serving <br />
                <span className="text-hs-primary italic">Luxury</span>
              </>
            )}
          </h1>
          <p className="text-hs-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {isAr
              ? 'في هورايزون ستيز، ندمج أرقى معايير الضيافة مع أحدث تقنيات الإدارة العالمية عبر نظام Odoo ERP، لنضمن لك تجربة لا تشوبها شائبة.'
              : 'At Horizon Stays, we merge the finest hospitality standards with the latest global management technologies via Odoo ERP, ensuring a flawless experience for you.'}
          </p>
        </motion.div>

        {/* Odoo Showcase Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mb-32 overflow-hidden rounded-3xl bg-hs-bg2 border border-hs-border p-8 md:p-16"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-hs-primary/10 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-hs-primary/10 blur-[100px] -ml-32 -mb-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block px-4 py-1 rounded-full bg-hs-primary/20 text-hs-primary text-sm font-semibold mb-6">
                Powered by Odoo ERP
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                {isAr ? 'كفاءة تشغيلية بلا حدود' : 'Limitless Operational Efficiency'}
              </h2>
              <p className="text-hs-muted leading-relaxed mb-8">
                {isAr
                  ? 'نظامنا المتكامل يربط كل تفاصيل إقامتك—من الحجز الأولي وحتى المغادرة—ببيئة محاسبية وإدارية مركزية. هذا يعني دقة متناهية في المواعيد، سرعة في الإجراءات، وتجربة ضيف خالية من التعقيدات.'
                  : 'Our integrated system connects every detail of your stay—from initial booking to departure—with a centralized accounting and management environment. This means ultimate punctuality, speed in procedures, and a hassle-free guest experience.'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-hs-bg border border-hs-border rounded-xl">
                  <div className="text-hs-primary text-2xl font-bold mb-1">100%</div>
                  <div className="text-xs text-hs-muted uppercase tracking-wider">
                    {isAr ? 'أتمتة العمليات' : 'Process Automation'}
                  </div>
                </div>
                <div className="p-4 bg-hs-bg border border-hs-border rounded-xl">
                  <div className="text-hs-primary text-2xl font-bold mb-1">0ms</div>
                  <div className="text-xs text-hs-muted uppercase tracking-wider">
                    {isAr ? 'تأخير في المزامنة' : 'Sync Latency'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full aspect-video bg-hs-bg border border-hs-border rounded-2xl flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-hs-primary/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="text-6xl md:text-8xl filter drop-shadow-2xl">⚙️</div>
              <div className="absolute bottom-4 left-4 right-4 bg-hs-bg/80 backdrop-blur-md border border-hs-border p-3 rounded-lg text-xs font-mono text-hs-muted">
                odoo.integration.active_sync_stable
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group p-8 bg-hs-bg2 border border-hs-border rounded-2xl hover:border-hs-primary/50 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-hs-bg border border-hs-border flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="font-serif text-xl font-semibold mb-4 text-hs-text group-hover:text-hs-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-hs-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-32 text-center"
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-hs-border to-transparent mb-12" />
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-8">
            {isAr ? 'مستقبل الضيافة يبدأ هنا' : 'The Future of Hospitality Starts Here'}
          </h2>
          <button className="px-12 py-4 bg-hs-primary text-hs-bg font-semibold rounded-full hover:bg-hs-primary/90 hover:scale-105 transition-all duration-300">
            {isAr ? 'استكشف وحداتنا' : 'Explore Our Units'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
