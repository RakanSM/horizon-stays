const WOZTELL_BASE = 'https://api.woztell.com/api/v1';

type WozTemplate = 'WELCOME' | 'DOOR_CODE' | 'CHECKOUT_REMINDER' | 'REVIEW_REQUEST' | 'CLAIM_NOTICE';

const templates: Record<WozTemplate, { body: (p: Record<string, string>) => string }> = {
  WELCOME: { body: p => `مرحباً ${p.name}! حجزك في ${p.property} مؤكد ✅\nتسجيل الدخول: ${p.check_in}` },
  DOOR_CODE: { body: p => `كود الدخول: *${p.code}*\nصالح حتى: ${p.expiry}` },
  CHECKOUT_REMINDER: { body: p => `تذكير: تسجيل الخروج غداً ${p.check_out} قبل الساعة 12 ظهراً` },
  REVIEW_REQUEST: { body: p => `نتمنى إقامة ممتازة! شاركنا رأيك: ${p.link}` },
  CLAIM_NOTICE: { body: p => `لديك مطالبة بقيمة ${p.amount} ريال. التفاصيل: ${p.link}` },
};

export async function sendWozTellMessage(phone: string, template: WozTemplate, params: Record<string, string>): Promise<void> {
  const apiKey = process.env.WOZTELL_API_KEY;
  const phoneNumberId = process.env.WOZTELL_PHONE_NUMBER_ID;
  if (!apiKey || !phoneNumberId) { console.warn('WozTell not configured — skipping message'); return; }
  const normalizedPhone = phone.startsWith('+') ? phone : `+966${phone.replace(/^0/, '')}`;
  const res = await fetch(`${WOZTELL_BASE}/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel_id: phoneNumberId, to: normalizedPhone, type: 'text', text: { body: templates[template].body(params) } }),
  });
  if (!res.ok) throw new Error(`WozTell send failed: ${await res.text()}`);
}
