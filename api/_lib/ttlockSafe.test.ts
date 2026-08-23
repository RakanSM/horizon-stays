import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { maskCredential, safeLock, safePasscode, safeRecord } from "./ttlockSafe";

describe("TTLock public data sanitising", () => {
  it("omits secret lock material and keeps only fields needed by the locks page", () => {
    expect(safeLock({ lockId: 81, lockAlias: "Horizon entrance", electricQuantity: 72, hasGateway: 1, lockKey: "secret", adminPwd: "secret" })).toEqual({
      lockId: 81,
      lockAlias: "Horizon entrance",
      lockName: "",
      electricQuantity: 72,
      hasGateway: true,
      keyboardPwdVersion: null,
      groupName: "",
    });
  });

  it("masks existing passcodes and credentials in history", () => {
    expect(maskCredential("123456")).toBe("••••56");
    expect(safePasscode({ keyboardPwdId: 2, lockId: 81, keyboardPwd: "123456", keyboardPwdName: "Guest" }).keyboardPwd).toBe("••••56");
    expect(safeRecord({ lockId: 81, success: 1, keyboardPwd: "123456" }).credential).toBe("••••56");
  });

  it("keeps sensitive door operations behind an explicit server-side confirmation", () => {
    const handler = readFileSync(resolve(process.cwd(), "api/ttlock.ts"), "utf8");
    expect(handler).toContain('case "rename"');
    expect(handler).toContain('case "create-passcode"');
    expect(handler).toContain('case "delete-passcode"');
    expect(handler).toContain('case "unlock"');
    expect(handler.match(/params\.confirmed !== true/g)?.length).toBeGreaterThanOrEqual(4);
  });
});
