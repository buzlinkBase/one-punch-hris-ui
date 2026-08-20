import { create } from "zustand";
import { annualTaxTableApi } from "../services/annual-tax-table.api";
import type { AnnualTaxTableResponse } from "../models/api/response/annual-tax-table-response.model";
import type { CreateAnnualTaxTable } from "../models/api/request/create-annual-tax-table.model";
import type { UpdateAnnualTaxTable } from "../models/api/request/update-annual-tax-table.model";

interface AnnualTaxTableStore {
  rows: AnnualTaxTableResponse[];
  selected: AnnualTaxTableResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (effectivity: string) => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateAnnualTaxTable) => Promise<void>;
  update: (data: UpdateAnnualTaxTable) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: AnnualTaxTableResponse | null) => void;
  clearError: () => void;
}

export const useAnnualTaxTableStore = create<AnnualTaxTableStore>((set) => ({
  rows: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (effectivity) => {
    set({ loading: true, error: null });
    try {
      const rows = await annualTaxTableApi.getAll(effectivity);
      set({ rows, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await annualTaxTableApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const row = await annualTaxTableApi.create(data);
      set((s) => ({ rows: [...s.rows, row], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await annualTaxTableApi.update(data);
      set((s) => ({
        rows: s.rows.map((r) => (r.id === updated.id ? updated : r)),
        selected: updated,
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await annualTaxTableApi.remove(id);
      set((s) => ({ rows: s.rows.filter((r) => r.id !== id), loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (item) => set({ selected: item }),
  clearError: () => set({ error: null }),
}));
