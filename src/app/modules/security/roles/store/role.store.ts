import { create } from "zustand";
import { roleApi } from "../services/role.api";
import type { RoleResponse } from "../models/api/response/role-response.model";
import type { CreateRole } from "../models/api/request/create-role.model";
import type { UpdateRole } from "../models/api/request/update-role.model";

interface RoleStore {
  roles: RoleResponse[];
  selected: RoleResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateRole) => Promise<void>;
  update: (data: UpdateRole) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (role: RoleResponse | null) => void;
  clearError: () => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
  roles: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const roles = await roleApi.getAll();
      set({ roles, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await roleApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const role = await roleApi.create(data);
      set((s) => ({ roles: [...s.roles, role], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await roleApi.update(data);
      set((s) => ({
        roles: s.roles.map((item) => (item.id === updated.id ? updated : item)),
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
      await roleApi.remove(id);
      set((s) => ({
        roles: s.roles.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (role) => set({ selected: role }),
  clearError: () => set({ error: null }),
}));
