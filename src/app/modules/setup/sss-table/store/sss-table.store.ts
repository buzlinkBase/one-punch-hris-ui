import { create } from "zustand";
import { sssTableApi } from "../services/sss-table.api";
import type { SssTableResponse } from "../models/api/response/sss-table-response.model";
import type { CreateSssTable } from "../models/api/request/create-sss-table.model";
import type { UpdateSssTable } from "../models/api/request/update-sss-table.model";

interface SssTableStore {
  rows: SssTableResponse[];
  selected: SssTableResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (effectivity: string) => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateSssTable) => Promise<void>;
  update: (data: UpdateSssTable) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: SssTableResponse | null) => void;
  clearError: () => void;
}

export const useSssTableStore = create<SssTableStore>((set) => ({
  rows: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (effectivity) => {
    set({ loading: true, error: null });
    try {
      const rows = await sssTableApi.getAll(effectivity);
      set({ rows, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await sssTableApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const row = await sssTableApi.create(data);
      set((s) => ({ rows: [...s.rows, row], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await sssTableApi.update(data);
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
      await sssTableApi.remove(id);
      set((s) => ({
        rows: s.rows.filter((r) => r.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (item) => set({ selected: item }),
  clearError: () => set({ error: null }),
}));
