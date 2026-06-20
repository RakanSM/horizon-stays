const TTLOCK_BASE = 'https://euapi.ttlock.com';

async function getTTLockToken(): Promise<string> {
  const res = await fetch(`${TTLOCK_BASE}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.TTLOCK_CLIENT_ID ?? '', client_secret: process.env.TTLOCK_CLIENT_SECRET ?? '', grant_type: 'client_credentials' }),
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function generateTemporaryCode(lockId: string, checkIn: string, checkOut: string) {
  const token = await getTTLockToken();
  const startDate = new Date(checkIn).getTime();
  const endDate = new Date(checkOut).getTime();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const res = await fetch(`${TTLOCK_BASE}/v3/keyboardPwd/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ clientId: process.env.TTLOCK_CLIENT_ID ?? '', accessToken: token, lockId, keyboardPwdType: '3', keyboardPwd: code, startDate: String(startDate), endDate: String(endDate), date: String(Date.now()) }),
  });
  const data = await res.json();
  if (data.errcode !== 0) throw new Error(`TTLock error: ${data.errmsg}`);
  return { code, keyboardPwdId: data.keyboardPwdId as number, startDate, endDate };
}

export async function deleteCode(lockId: string, keyboardPwdId: number) {
  const token = await getTTLockToken();
  const res = await fetch(`${TTLOCK_BASE}/v3/keyboardPwd/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ clientId: process.env.TTLOCK_CLIENT_ID ?? '', accessToken: token, lockId, keyboardPwdId: String(keyboardPwdId), date: String(Date.now()) }),
  });
  const data = await res.json();
  return data.errcode === 0;
}

export async function getLockStatus(lockId: string) {
  const token = await getTTLockToken();
  const res = await fetch(`${TTLOCK_BASE}/v3/lock/queryOpenState?clientId=${process.env.TTLOCK_CLIENT_ID}&accessToken=${token}&lockId=${lockId}&date=${Date.now()}`, { method: 'GET' });
  const data = await res.json();
  return { state: data.state as 0 | 1 | 2, batteryLevel: data.electricQuantity as number };
}
