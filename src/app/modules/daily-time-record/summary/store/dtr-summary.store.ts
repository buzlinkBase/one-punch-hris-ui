import { create } from "zustand";
import { dtrSummaryApi } from "../services/dtr-summary.api";
import type { DtrSummaryResponse } from "../models/api/response/dtr-summary-response.model";
import type { DtrSummaryFilter } from "../models/api/request/dtr-summary-filter.model";

interface DtrSummaryStore {
  records: DtrSummaryResponse[];
  selected: DtrSummaryResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (filter?: DtrSummaryFilter) => Promise<void>;
  setSelected: (record: DtrSummaryResponse | null) => void;
  clearError: () => void;
}

export const useDtrSummaryStore = create<DtrSummaryStore>((set) => ({
  records: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (filter = {}) => {
    set({ loading: true, error: null });
    try {
      const records = await dtrSummaryApi.getAll(filter);
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (record) => set({ selected: record }),

  clearError: () => set({ error: null }),
}));
