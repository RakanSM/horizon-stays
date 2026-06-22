'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/admin');
  }

  return (
    <div className="min-h-screen bg-hs-bg flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm bg-hs-bg2 border border-hs-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-hs-primary">Horizon Stays</h1>
          <p className="text-hs-muted text-sm mt-2">لوحة الإدارة</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-hs-red text-xs text-center">{error}</p>}
          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">دخول</Button>
        </form>
      </div>
    </div>
  );
}
