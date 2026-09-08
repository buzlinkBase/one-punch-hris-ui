import { create } from "zustand";
import { wtaxTableApi } from "../services/wtax-table.api";
import type { WtaxTableResponse } from "../models/api/response/wtax-table-response.model";
import type { CreateWtaxTable } from "../models/api/request/create-wtax-table.model";
import type { UpdateWtaxTable } from "../models/api/request/update-wtax-table.model";

interface WtaxTableStore {
  rows: WtaxTableResponse[];
  selected: WtaxTableResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (payrollType: string) => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateWtaxTable) => Promise<void>;
  update: (data: UpdateWtaxTable) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: WtaxTableResponse | null) => void;
  clearError: () => void;
}

export const useWtaxTableStore = create<WtaxTableStore>((set) => ({
  rows: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (payrollType) => {
    set({ loading: true, error: null });
    try {
      const rows = await wtaxTableApi.getAll(payrollType);
      set({ rows, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await wtaxTableApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const row = await wtaxTableApi.create(data);
      set((s) => ({ rows: [...s.rows, row], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await wtaxTableApi.update(data);
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
      await wtaxTableApi.remove(id);
      set((s) => ({ rows: s.rows.filter((r) => r.id !== id), loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (item) => set({ selected: item }),
  clearError: () => set({ error: null }),
}));
