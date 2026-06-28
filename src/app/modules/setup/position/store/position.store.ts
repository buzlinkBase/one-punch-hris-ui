import { create } from 'zustand';
import { positionApi } from '../services/position.api';
import type { PositionResponse } from '../models/api/response/position-response.model';
import type { CreatePosition } from '../models/api/request/create-position.model';
import type { UpdatePosition } from '../models/api/request/update-position.model';

interface PositionStore {
  positions: PositionResponse[];
  selected: PositionResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreatePosition) => Promise<void>;
  update: (data: UpdatePosition) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (position: PositionResponse | null) => void;
  clearError: () => void;
}

export const usePositionStore = create<PositionStore>((set) => ({
  positions: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const positions = await positionApi.getAll();
      set({ positions, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await positionApi.getById(id);
      set({ selected, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const position = await positionApi.create(data);
      set((s) => ({ positions: [...s.positions, position], loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await positionApi.update(data);
      set((s) => ({
        positions: s.positions.map((p) => (p.id === updated.id ? updated : p)),
        selected: updated,
        loading: false,
      }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await positionApi.remove(id);
      set((s) => ({ positions: s.positions.filter((p) => p.id !== id), loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  setSelected: (position) => set({ selected: position }),
  clearError: () => set({ error: null }),
}));
