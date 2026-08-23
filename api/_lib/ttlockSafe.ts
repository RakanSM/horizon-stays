export type TTLockPublicLock = {
  lockId: number;
  lockAlias: string;
  lockName: string;
  electricQuantity: number | null;
  hasGateway: boolean;
  keyboardPwdVersion: number | null;
  groupName: string;
};

export type TTLockPublicPasscode = {
  keyboardPwdId: number;
  lockId: number;
  keyboardPwd: string;
  keyboardPwdName: string;
  keyboardPwdType: number | null;
  startDate: number | null;
  endDate: number | null;
  status: number | null;
};

export type TTLockPublicRecord = {
  lockId: number;
  recordType: number | null;
  success: boolean;
  username: string;
  credential: string;
  lockDate: number | null;
  serverDate: number | null;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberOrNull(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** The web page never needs lock data, admin codes, keys, or full historical passcodes. */
export function maskCredential(value: unknown) {
  const raw = text(value);
  if (!raw) return "—";
  if (raw.length <= 2) return "••";
  return `${"•".repeat(Math.max(4, raw.length - 2))}${raw.slice(-2)}`;
}

export function safeLock(input: Record<string, unknown>): TTLockPublicLock {
  return {
    lockId: Number(input.lockId),
    lockAlias: text(input.lockAlias),
    lockName: text(input.lockName),
    electricQuantity: numberOrNull(input.electricQuantity),
    hasGateway: Number(input.hasGateway) === 1,
    keyboardPwdVersion: numberOrNull(input.keyboardPwdVersion),
    groupName: text(input.groupName),
  };
}

export function safePasscode(input: Record<string, unknown>): TTLockPublicPasscode {
  return {
    keyboardPwdId: Number(input.keyboardPwdId),
    lockId: Number(input.lockId),
    keyboardPwd: maskCredential(input.keyboardPwd),
    keyboardPwdName: text(input.keyboardPwdName) || "—",
    keyboardPwdType: numberOrNull(input.keyboardPwdType),
    startDate: numberOrNull(input.startDate),
    endDate: numberOrNull(input.endDate),
    status: numberOrNull(input.status),
  };
}

export function safeRecord(input: Record<string, unknown>): TTLockPublicRecord {
  return {
    lockId: Number(input.lockId),
    recordType: numberOrNull(input.recordType),
    success: Number(input.success) === 1,
    username: text(input.username) || "—",
    credential: maskCredential(input.keyboardPwd),
    lockDate: numberOrNull(input.lockDate),
    serverDate: numberOrNull(input.serverDate),
  };
}
