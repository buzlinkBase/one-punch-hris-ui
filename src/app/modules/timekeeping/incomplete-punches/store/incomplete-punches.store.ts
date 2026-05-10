import { create } from "zustand";
import { incompletePunchesApi } from "../services/incomplete-punches.api";
import type {
  IncompletePunch,
  IncompletePunchesFilterRequest,
} from "../models/api/response/incomplete-punch.model";

interface IncompletePunchesStore {
  incompletePunches: IncompletePunch[];
  loading: boolean;
  error: string | null;
  filters: IncompletePunchesFilterRequest;
  loadAll: (filters?: IncompletePunchesFilterRequest) => Promise<void>;
  setFilters: (filters: IncompletePunchesFilterRequest) => void;
  clearError: () => void;
}

export const useIncompletePunchesStore = create<IncompletePunchesStore>(
  (set) => ({
    incompletePunches: [],
    loading: false,
    error: null,
    filters: {},

    loadAll: async (filters) => {
      set({ loading: true, error: null });
      try {
        const data = await incompletePunchesApi.getAll(filters);
        set({
          incompletePunches: data.incompletePunches,
          filters: filters || {},
          loading: false,
        });
      } catch (err) {
        set({ error: String(err), loading: false });
      }
    },

    setFilters: (filters) => set({ filters }),
    clearError: () => set({ error: null }),
  }),
);
