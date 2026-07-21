'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { useParams } from 'next/navigation';

interface OdooStatus {
  connected: boolean;
  odoo_url: string;
  database: string;
  message: string;
}

interface SyncLog {
  id: string;
  bookingId: string;
  action: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  error?: string;
}

export default function OdooIntegrationPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const [status, setStatus] = useState<OdooStatus | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check Odoo connection status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/integrations/odoo?action=status');
        if (!response.ok) throw new Error('Failed to fetch status');
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        console.error('Error checking Odoo status:', err);
        setError(isAr ? 'فشل التحقق من الاتصال' : 'Failed to check connection');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [isAr]);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/cron/sync-bookings-to-odoo', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Sync failed');

      const data = await response.json();
      setSyncLogs((prev) => [
        {
          id: Date.now().toString(),
          bookingId: 'manual-trigger',
          action: 'manual_sync',
          status: 'success',
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Sync error:', err);
      setError(isAr ? 'فشل المزامنة' : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-hs-bg p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold text-hs-text mb-2">
            {isAr ? 'تكامل Odoo' : 'Odoo Integration'}
          </h1>
          <p className="text-hs-muted">
            {isAr
              ? 'إدارة المزامنة التلقائية للحجوزات إلى Odoo ERP'
              : 'Manage automatic booking synchronization to Odoo ERP'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Connection Status */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-hs-bg2 border border-hs-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-hs-text">
                {isAr ? 'حالة الاتصال' : 'Connection Status'}
              </h2>
              <div
                className={`w-3 h-3 rounded-full ${
                  status?.connected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-sm text-hs-muted mb-2">
              {status?.message || (loading ? isAr ? 'جاري التحميل...' : 'Loading...' : 'Unknown')}
            </p>
            {status && (
              <>
                <p className="text-xs text-hs-muted mb-1">
                  <span className="font-semibold">{isAr ? 'URL:' : 'URL:'}</span> {status.odoo_url}
                </p>
                <p className="text-xs text-hs-muted">
                  <span className="font-semibold">{isAr ? 'قاعدة البيانات:' : 'Database:'}</span>{' '}
                  {status.database}
                </p>
              </>
            )}
          </div>

          <div className="bg-hs-bg2 border border-hs-border rounded-2xl p-6">
            <h2 className="font-semibold text-hs-text mb-4">
              {isAr ? 'المزامنة التلقائية' : 'Auto Sync'}
            </h2>
            <p className="text-sm text-hs-muted mb-4">
              {isAr
                ? 'تعمل يومياً في الساعة 2 صباحاً'
                : 'Runs daily at 2:00 AM'}
            </p>
            <Button
              onClick={handleManualSync}
              disabled={syncing || !status?.connected}
              className="w-full"
            >
              {syncing ? (isAr ? 'جاري المزامنة...' : 'Syncing...') : isAr ? 'مزامنة يدوية' : 'Manual Sync'}
            </Button>
          </div>

          <div className="bg-hs-bg2 border border-hs-border rounded-2xl p-6">
            <h2 className="font-semibold text-hs-text mb-4">
              {isAr ? 'الميزات المدعومة' : 'Supported Features'}
            </h2>
            <ul className="text-xs text-hs-muted space-y-1">
              <li>✓ {isAr ? 'أوامر الإيجار' : 'Rental Orders'}</li>
              <li>✓ {isAr ? 'الفواتير' : 'Invoicing'}</li>
              <li>✓ {isAr ? 'المحاسبة' : 'Accounting'}</li>
              <li>✓ {isAr ? 'النفقات' : 'Expenses'}</li>
            </ul>
          </div>
        </div>

        {/* Integration Features */}
        <div className="mb-8 bg-hs-bg2 border border-hs-border rounded-2xl p-6">
          <h2 className="font-serif text-2xl font-semibold text-hs-text mb-6">
            {isAr ? 'ميزات التكامل' : 'Integration Features'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: isAr ? 'أوامر الإيجار' : 'Rental Orders',
                description: isAr
                  ? 'ينشئ تلقائياً أوامر إيجار في Odoo عند تأكيد الحجز'
                  : 'Automatically creates rental orders in Odoo when booking is confirmed',
                icon: '📋',
              },
              {
                title: isAr ? 'الفواتير' : 'Invoicing',
                description: isAr
                  ? 'ينشئ فواتير تلقائياً عند استلام الدفع'
                  : 'Automatically generates invoices when payment is received',
                icon: '🧾',
              },
              {
                title: isAr ? 'المحاسبة' : 'Accounting',
                description: isAr
                  ? 'يسجل جميع المعاملات المالية في دفاتر Odoo'
                  : 'Records all financial transactions in Odoo ledger',
                icon: '📊',
              },
              {
                title: isAr ? 'النفقات' : 'Expenses',
                description: isAr
                  ? 'يتتبع نفقات الصيانة والتشغيل لكل عقار'
                  : 'Tracks maintenance and operational expenses per property',
                icon: '💰',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-4 border border-hs-border rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-semibold text-hs-text mb-1">{feature.title}</h3>
                    <p className="text-sm text-hs-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="mb-8 bg-hs-bg2 border border-hs-border rounded-2xl p-6">
          <h2 className="font-serif text-2xl font-semibold text-hs-text mb-4">
            {isAr ? 'الإعدادات المطلوبة' : 'Required Configuration'}
          </h2>
          <p className="text-sm text-hs-muted mb-4">
            {isAr
              ? 'تأكد من تعيين متغيرات البيئة التالية في Vercel:'
              : 'Ensure the following environment variables are set in Vercel:'}
          </p>
          <div className="bg-hs-bg p-4 rounded-lg font-mono text-xs text-hs-muted space-y-2">
            <div>ODOO_URL=https://yourdomain.odoo.com</div>
            <div>ODOO_DATABASE=yourdomain</div>
            <div>ODOO_USERNAME=your-email@example.com</div>
            <div>ODOO_PASSWORD=your-password</div>
            <div>ODOO_API_KEY=your-api-token</div>
          </div>
        </div>

        {/* Sync Logs */}
        <div className="bg-hs-bg2 border border-hs-border rounded-2xl p-6">
          <h2 className="font-serif text-2xl font-semibold text-hs-text mb-4">
            {isAr ? 'سجل المزامنة' : 'Sync Logs'}
          </h2>
          {syncLogs.length === 0 ? (
            <p className="text-hs-muted text-sm">
              {isAr ? 'لا توجد سجلات مزامنة حتى الآن' : 'No sync logs yet'}
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-hs-bg border border-hs-border rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-hs-text text-sm">{log.action}</p>
                    <p className="text-xs text-hs-muted">{log.bookingId}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        log.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : log.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {log.status}
                    </span>
                    <p className="text-xs text-hs-muted mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
