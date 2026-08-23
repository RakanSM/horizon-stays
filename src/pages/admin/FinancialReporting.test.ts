import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(new URL("../../../migrations/20260824_financial_status_reporting.sql", import.meta.url), "utf8");
const operations = readFileSync(new URL("./AdminOperations.tsx", import.meta.url), "utf8");
const finance = readFileSync(new URL("./AdminFinance.tsx", import.meta.url), "utf8");
const landlord = readFileSync(new URL("../Landlord.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../../index.css", import.meta.url), "utf8");

describe("financial reporting status visibility", () => {
  it("keeps both financial reports protected and scopes owner data inside the database functions", () => {
    expect(migration).toContain("IF NOT _is_admin(p_token)");
    expect(migration).toContain("session_token = p_token AND is_active = true");
    expect(migration).toContain("pl.landlord_id = v_landlord.id");
    expect(migration).toContain("SECURITY DEFINER SET search_path = public");
  });

  it("returns explicit reservation, collection, invoice, expense, and settlement status summaries", () => {
    for (const field of ["payment_statuses", "booking_statuses", "expense_statuses", "invoice_summary", "settlement_status", "collection_review_revenue", "fully_paid_revenue"]) {
      expect(migration).toContain(`'${field}'`);
    }
    expect(migration).toContain("WHEN 'partial' THEN 'partial'");
    expect(migration).toContain("WHEN 'refunded' THEN 'refunded'");
  });

  it("makes admin expense status and paid amount visible without treating legacy costs as operational expenses", () => {
    expect(operations).toContain("مبلغ مصروفات مسدد");
    expect(operations).toContain("حجوزات تحتاج تسوية");
    expect(operations).toContain("إدارة المصروفات");
    expect(operations).toContain("دفتر التكاليف الدورية وطلبات الصيانة يبقى منفصلاً");
    expect(operations).toContain("window.prompt");
  });

  it("uses the protected status report on the main finance page with date and property filters", () => {
    expect(finance).toContain('adminRpc<AdminFinancialReport>("admin_financial_report"');
    expect(finance).toContain("p_property_id");
    expect(finance).toContain("حالة التسوية المالية");
    expect(finance).toContain("تصدير CSV");
  });

  it("keeps landlord settlement visibility owner-scoped and warns against double counting older cost ledgers", () => {
    expect(landlord).toContain("حالة مراجعة التسوية");
    expect(landlord).toContain("فواتير الضيوف ضمن الفلتر");
    expect(landlord).toContain("لا تُخصم تلقائياً من صافي التقرير التشغيلي");
  });

  it("keeps financial status filters and badges usable at the small-screen breakpoint", () => {
    expect(styles).toContain("@media(max-width:560px){.ops-kpis,.ops-form{grid-template-columns:1fr}");
    expect(styles).toContain(".ops-filter{display:grid;grid-template-columns:1fr}");
    expect(styles).toContain(".ops-status.collection_review");
    expect(styles).toContain(".ops-status.ready_for_review");
  });
});
