import { create } from "zustand";
import { dtrDetailApi } from "../services/dtr-detail.api";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";

interface DtrDetailStore {
  records: DtrDetailResponse[];
  selected: DtrDetailResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (filter?: DtrDetailFilter) => Promise<void>;
  setSelected: (record: DtrDetailResponse | null) => void;
  clearError: () => void;
}

export const useDtrDetailStore = create<DtrDetailStore>((set) => ({
  records: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (filter = {}) => {
    set({ loading: true, error: null });
    try {
      const records = await dtrDetailApi.getAll(filter);
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (record) => set({ selected: record }),

  clearError: () => set({ error: null }),
}));
