import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') ?? 'bookings';
  const supabase = createServerClient() as any;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Horizon Stays';
  if (type === 'bookings') {
    const { data } = await supabase.from('bookings').select('*, property:properties(internal_name)').order('created_at', { ascending: false });
    const ws = wb.addWorksheet('الحجوزات');
    ws.columns = [{ header: 'رقم الحجز', key: 'id', width: 15 }, { header: 'الضيف', key: 'guest_name', width: 20 }, { header: 'الجوال', key: 'guest_phone', width: 15 }, { header: 'الوحدة', key: 'property', width: 20 }, { header: 'المنصة', key: 'platform', width: 12 }, { header: 'الدخول', key: 'check_in', width: 12 }, { header: 'الخروج', key: 'check_out', width: 12 }, { header: 'الليالي', key: 'nights', width: 8 }, { header: 'المبلغ', key: 'amount_sar', width: 12 }, { header: 'الحالة', key: 'status', width: 12 }];
    (data ?? []).forEach((b: any) => ws.addRow({ ...b, property: (b.property as { internal_name?: string })?.internal_name }));
  } else if (type === 'expenses') {
    const { data } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
    const ws = wb.addWorksheet('المصروفات');
    ws.columns = [{ header: 'التاريخ', key: 'expense_date', width: 12 }, { header: 'التصنيف', key: 'tab', width: 12 }, { header: 'الفئة', key: 'category', width: 15 }, { header: 'الوصف', key: 'description', width: 25 }, { header: 'المبلغ', key: 'amount_sar', width: 12 }];
    (data ?? []).forEach((e: any) => ws.addRow(e));
  }
  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf as BodyInit, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename=horizon-stays-${type}-${new Date().toISOString().slice(0,10)}.xlsx` } });
}
