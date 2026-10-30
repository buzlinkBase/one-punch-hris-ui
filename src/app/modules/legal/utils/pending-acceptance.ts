const KEY = "terms-pending-acceptance";

// The Terms version an owner agreed to while setting up a company. The company doesn't exist
// yet at that moment (it is created in the background), so the acceptance is recorded for it on
// the first screen after setup, by TermsAcceptanceGate -- without asking a second time.
export const pendingTermsAcceptance = {
  set(version: number): void {
    try {
      localStorage.setItem(KEY, String(version));
    } catch {
      // Storage unavailable: the owner is simply asked to accept once the company is ready.
    }
  },
  get(): number | null {
    try {
      const value = Number(localStorage.getItem(KEY));
      return Number.isInteger(value) && value > 0 ? value : null;
    } catch {
      return null;
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing to clear.
    }
  },
};
