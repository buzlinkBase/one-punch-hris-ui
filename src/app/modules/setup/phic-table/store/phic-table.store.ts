import { create } from "zustand";
import { phicTableApi } from "../services/phic-table.api";
import type { PhicTableResponse } from "../models/api/response/phic-table-response.model";
import type { CreatePhicTable } from "../models/api/request/create-phic-table.model";
import type { UpdatePhicTable } from "../models/api/request/update-phic-table.model";

interface PhicTableStore {
  rows: PhicTableResponse[];
  selected: PhicTableResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreatePhicTable) => Promise<void>;
  update: (data: UpdatePhicTable) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: PhicTableResponse | null) => void;
  clearError: () => void;
}

export const usePhicTableStore = create<PhicTableStore>((set) => ({
  rows: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const rows = await phicTableApi.getAll();
      set({ rows, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await phicTableApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const row = await phicTableApi.create(data);
      set((s) => ({ rows: [...s.rows, row], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await phicTableApi.update(data);
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
      await phicTableApi.remove(id);
      set((s) => ({ rows: s.rows.filter((r) => r.id !== id), loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (item) => set({ selected: item }),
  clearError: () => set({ error: null }),
}));
