export const DEVICE_TOKEN_STORAGE_KEY = "boxautomat-device-token";
export const RECOVERY_CODE_STORAGE_KEY = "boxautomat-recovery-code";

function randomSegment(length: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);

  return Array.from(values, (value) => chars[value % chars.length]).join("");
}

export function createDeviceToken() {
  if (window.crypto.randomUUID) {
    return `bx-${window.crypto.randomUUID()}`;
  }

  return `bx-${randomSegment(24)}`;
}

export function createRecoveryCode() {
  return `BA-${randomSegment(4)}-${randomSegment(4)}`;
}

export function getOrCreateOwnershipIdentity() {
  let ownerToken = window.localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);
  let recoveryCode = window.localStorage.getItem(RECOVERY_CODE_STORAGE_KEY);

  if (!ownerToken) {
    ownerToken = createDeviceToken();
    window.localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, ownerToken);
  }

  if (!recoveryCode) {
    recoveryCode = createRecoveryCode();
    window.localStorage.setItem(RECOVERY_CODE_STORAGE_KEY, recoveryCode);
  }

  return {
    ownerToken,
    recoveryCode
  };
}
