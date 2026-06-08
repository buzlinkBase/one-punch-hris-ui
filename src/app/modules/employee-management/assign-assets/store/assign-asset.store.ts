import { create } from "zustand";
import { assignAssetApi } from "../services/assign-asset.api";
import type { AssignAssetResponse } from "../models/api/response/assign-asset-response.model";
import type { CreateAssignAsset } from "../models/api/request/create-assign-asset.model";
import type { UpdateAssignAsset } from "../models/api/request/update-assign-asset.model";

interface AssignAssetStore {
  assets: AssignAssetResponse[];
  selected: AssignAssetResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateAssignAsset) => Promise<void>;
  update: (data: UpdateAssignAsset) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: AssignAssetResponse | null) => void;
  clearError: () => void;
}

export const useAssignAssetStore = create<AssignAssetStore>((set) => ({
  assets: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const assets = await assignAssetApi.getAll();
      set({ assets, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await assignAssetApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const item = await assignAssetApi.create(data);
      set((s) => ({ assets: [...s.assets, item], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await assignAssetApi.update(data);
      set((s) => ({
        assets: s.assets.map((a) => (a.id === updated.id ? updated : a)),
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
      await assignAssetApi.remove(id);
      set((s) => ({
        assets: s.assets.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (item) => set({ selected: item }),
  clearError: () => set({ error: null }),
}));
