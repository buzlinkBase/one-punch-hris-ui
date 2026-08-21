import { create } from "zustand";
import { hdmfTableApi } from "../services/hdmf-table.api";
import type { HdmfTableResponse } from "../models/api/response/hdmf-table-response.model";
import type { CreateHdmfTable } from "../models/api/request/create-hdmf-table.model";
import type { UpdateHdmfTable } from "../models/api/request/update-hdmf-table.model";

interface HdmfTableStore {
  rows: HdmfTableResponse[];
  selected: HdmfTableResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (effectivity: string) => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateHdmfTable) => Promise<void>;
  update: (data: UpdateHdmfTable) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: HdmfTableResponse | null) => void;
  clearError: () => void;
}

export const useHdmfTableStore = create<HdmfTableStore>((set) => ({
  rows: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (effectivity) => {
    set({ loading: true, error: null });
    try {
      const rows = await hdmfTableApi.getAll(effectivity);
      set({ rows, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await hdmfTableApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const row = await hdmfTableApi.create(data);
      set((s) => ({ rows: [...s.rows, row], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await hdmfTableApi.update(data);
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
      await hdmfTableApi.remove(id);
      set((s) => ({ rows: s.rows.filter((r) => r.id !== id), loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (item) => set({ selected: item }),
  clearError: () => set({ error: null }),
}));
