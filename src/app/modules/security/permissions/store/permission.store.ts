import { create } from "zustand";
import { permissionApi } from "../services/permission.api";
import type { PermissionResponse } from "../models/api/response/permission-response.model";
import type { CreatePermission } from "../models/api/request/create-permission.model";
import type { UpdatePermission } from "../models/api/request/update-permission.model";

interface PermissionStore {
  permissions: PermissionResponse[];
  selected: PermissionResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreatePermission) => Promise<void>;
  update: (data: UpdatePermission) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (permission: PermissionResponse | null) => void;
  clearError: () => void;
}

export const usePermissionStore = create<PermissionStore>((set) => ({
  permissions: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const permissions = await permissionApi.getAll();
      set({ permissions, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await permissionApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const permission = await permissionApi.create(data);
      set((s) => ({
        permissions: [...s.permissions, permission],
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await permissionApi.update(data);
      set((s) => ({
        permissions: s.permissions.map((p) =>
          p.id === updated.id ? updated : p,
        ),
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
      await permissionApi.remove(id);
      set((s) => ({
        permissions: s.permissions.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (permission) => set({ selected: permission }),
  clearError: () => set({ error: null }),
}));
