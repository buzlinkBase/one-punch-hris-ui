import { create } from "zustand";
import { unregisterEmployeeApi } from "../services/unregister-employee.api";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";
import type { UnregisteredAttendanceLog } from "../models/api/response/unregister-employee-response.model";

interface UnregisterEmployeeStore {
  logs: UnregisteredAttendanceLog[];
  selected: UnregisteredAttendanceLog | null;
  loading: boolean;
  error: string | null;
  filters: UnregisterEmployeeFilter;
  loadAll: (filter?: UnregisterEmployeeFilter) => Promise<void>;
  setSelected: (log: UnregisteredAttendanceLog | null) => void;
  setFilters: (filters: UnregisterEmployeeFilter) => void;
  clearError: () => void;
}

export const useUnregisterEmployeeStore = create<UnregisterEmployeeStore>(
  (set) => ({
    logs: [],
    selected: null,
    loading: false,
    error: null,
    filters: {},

    loadAll: async (filter = {}) => {
      set({ loading: true, error: null });
      try {
        const logs = await unregisterEmployeeApi.getAll(filter);
        set({ logs, filters: filter, loading: false });
      } catch (err) {
        set({ error: String(err), loading: false });
      }
    },

    setSelected: (log) => set({ selected: log }),
    setFilters: (filters) => set({ filters }),
    clearError: () => set({ error: null }),
  }),
);
