import { create } from "zustand";
import type { ForPayrollResponse } from "../models/api/response/for-payroll-response.model";
import type { ForPayrollFilter } from "../models/api/request/for-payroll-filter.model";

interface ForPayrollStore {
  records: ForPayrollResponse[];
  selected: ForPayrollResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (filter?: ForPayrollFilter) => Promise<void>;
  setSelected: (record: ForPayrollResponse | null) => void;
  clearError: () => void;
}

export const useForPayrollStore = create<ForPayrollStore>((set) => ({
  records: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (filter = {}) => {
    set({ loading: true, error: null });
    try {
      void filter;
      const records: ForPayrollResponse[] = [];
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (record) => set({ selected: record }),

  clearError: () => set({ error: null }),
}));
