/** Actions that only look: viewing, exporting, and the confidential-record clearances. */
const READ_ACTIONS = new Set([
  "View",
  "Export",
  "Access",
  "Operations",
  "Entries",
]);

/** Billing stays fully usable while read-only -- it's how the company pays its way back. */
const ALWAYS_ALLOWED_MODULES = ["Billing:"];

/**
 * Whether a permission still counts while the company is read-only. The server refuses every
 * write then (SubscriptionAccessPolicy), so the UI hides the actions that would only be refused.
 * Anything not known to be a read is treated as a write.
 */
export function allowedWhileReadOnly(code: string): boolean {
  if (ALWAYS_ALLOWED_MODULES.some((prefix) => code.startsWith(prefix))) {
    return true;
  }
  const action = code.slice(code.lastIndexOf(":") + 1);
  return READ_ACTIONS.has(action);
}
