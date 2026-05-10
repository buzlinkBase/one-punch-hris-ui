import { create } from "zustand";
import { tardinessApi } from "../services/tardiness.api";
import type { TardinessResponse } from "../models/api/response/tardiness-response.model";
import type { TardinessFilter } from "../models/api/request/tardiness-filter.model";

interface TardinessStore {
  records: TardinessResponse[];
  selected: TardinessResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (filter?: TardinessFilter) => Promise<void>;
  setSelected: (record: TardinessResponse | null) => void;
  clearError: () => void;
}

export const useTardinessStore = create<TardinessStore>((set) => ({
  records: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (filter = {}) => {
    set({ loading: true, error: null });
    try {
      const records = await tardinessApi.getAll(filter);
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (record) => set({ selected: record }),

  clearError: () => set({ error: null }),
}));
