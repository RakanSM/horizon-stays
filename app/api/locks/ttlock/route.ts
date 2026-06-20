import { NextResponse } from 'next/server';
import { generateTemporaryCode, deleteCode, getLockStatus } from '@/lib/ttlock';

export async function POST(req: Request) {
  const { action, lockId, startTime, endTime, keyboardPwdId } = await req.json();
  try {
    switch (action) {
      case 'generateCode': return NextResponse.json({ data: await generateTemporaryCode(lockId, startTime, endTime) });
      case 'deleteCode': return NextResponse.json({ data: { deleted: await deleteCode(lockId, keyboardPwdId) } });
      case 'getStatus': return NextResponse.json({ data: await getLockStatus(lockId) });
      default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: unknown) { return NextResponse.json({ error: err instanceof Error ? err.message : 'TTLock error' }, { status: 500 }); }
}
