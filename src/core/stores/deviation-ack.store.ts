import { create } from "zustand";

/** One setting that differs from the Philippine statutory (DOLE) default, as hrms-api reports it. */
export interface StatutoryDeviation {
  key: string;
  label: string;
  statutoryValue: string;
  configuredValue: string;
  note: string;
}

interface PendingAck {
  deviations: StatutoryDeviation[];
  resolve: (acknowledged: boolean) => void;
}

interface DeviationAckStore {
  pending: PendingAck | null;
  /** Shows the acknowledgment modal; resolves true when the admin confirms, false when they cancel. */
  request: (deviations: StatutoryDeviation[]) => Promise<boolean>;
  answer: (acknowledged: boolean) => void;
}

// Asked by withDeviationAck (core/http/deviation-ack.ts); DeviationAckModal (mounted in the main
// layout) shows it and answers.
export const useDeviationAckStore = create<DeviationAckStore>((set, get) => ({
  pending: null,
  request: (deviations) =>
    new Promise<boolean>((resolve) => {
      get().pending?.resolve(false);
      set({ pending: { deviations, resolve } });
    }),
  answer: (acknowledged) => {
    get().pending?.resolve(acknowledged);
    set({ pending: null });
  },
}));
