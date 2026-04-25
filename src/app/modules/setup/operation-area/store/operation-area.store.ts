import { create } from 'zustand';
import { operationAreaApi } from '../services/operation-area.api';
import type { OperationAreaResponse } from '../models/api/response/operation-area-response.model';
import type { CreateOperationArea } from '../models/api/request/create-operation-area.model';
import type { UpdateOperationArea } from '../models/api/request/update-operation-area.model';

interface OperationAreaStore {
  operationAreas: OperationAreaResponse[];
  selected: OperationAreaResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateOperationArea) => Promise<void>;
  update: (data: UpdateOperationArea) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (area: OperationAreaResponse | null) => void;
  clearError: () => void;
}

export const useOperationAreaStore = create<OperationAreaStore>((set) => ({
  operationAreas: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const operationAreas = await operationAreaApi.getAll();
      set({ operationAreas, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await operationAreaApi.getById(id);
      set({ selected, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const area = await operationAreaApi.create(data);
      set((s) => ({ operationAreas: [...s.operationAreas, area], loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await operationAreaApi.update(data);
      set((s) => ({
        operationAreas: s.operationAreas.map((a) => (a.id === updated.id ? updated : a)),
        selected: updated,
        loading: false,
      }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await operationAreaApi.remove(id);
      set((s) => ({ operationAreas: s.operationAreas.filter((a) => a.id !== id), loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  setSelected: (area) => set({ selected: area }),
  clearError: () => set({ error: null }),
}));
