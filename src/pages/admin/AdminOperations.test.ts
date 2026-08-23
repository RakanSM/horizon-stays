import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./AdminOperations.tsx", import.meta.url), "utf8");

describe("Horizon internal operations suite", () => {
  it("includes the requested internal modules without a Sales workspace", () => {
    for (const module of ["crm", "pos", "subscriptions", "rental", "accounting", "documents", "spreadsheets", "signatures", "invoices"]) {
      expect(source).toContain(`id: "${module}"`);
    }
    expect(source).not.toContain('id: "sales"');
  });

  it("keeps finance, expenses, and module records on protected admin RPCs", () => {
    expect(source).toContain('"admin_financial_report"');
    expect(source).toContain('"admin_operation_expense"');
    expect(source).toContain('"admin_operations"');
    expect(source).toContain("window.confirm");
  });
});
