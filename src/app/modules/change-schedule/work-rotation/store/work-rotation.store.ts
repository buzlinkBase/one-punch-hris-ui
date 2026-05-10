import { create } from "zustand";
import { workRotationApi } from "../services/work-rotation.api";
import type { WorkRotationResponse } from "../models/api/response/work-rotation-response.model";
import type { CreateWorkRotation } from "../models/api/request/create-work-rotation.model";
import type { UpdateWorkRotation } from "../models/api/request/update-work-rotation.model";

interface WorkRotationStore {
  records: WorkRotationResponse[];
  selected: WorkRotationResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateWorkRotation) => Promise<void>;
  update: (data: UpdateWorkRotation) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (record: WorkRotationResponse | null) => void;
  clearError: () => void;
}

export const useWorkRotationStore = create<WorkRotationStore>((set) => ({
  records: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const records = await workRotationApi.getAll();
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await workRotationApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const record = await workRotationApi.create(data);
      set((s) => ({ records: [...s.records, record], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await workRotationApi.update(data);
      set((s) => ({
        records: s.records.map((r) => (r.id === updated.id ? updated : r)),
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
      await workRotationApi.remove(id);
      set((s) => ({
        records: s.records.filter((r) => r.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (record) => set({ selected: record }),
  clearError: () => set({ error: null }),
}));
