import { create } from "zustand";
import { userApi } from "../services/user.api";
import type { UserResponse } from "../models/api/response/user-response.model";
import type { CreateUser } from "../models/api/request/create-user.model";
import type { UpdateUser } from "../models/api/request/update-user.model";

interface UserStore {
  users: UserResponse[];
  selected: UserResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateUser) => Promise<void>;
  update: (data: UpdateUser) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (user: UserResponse | null) => void;
  clearError: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const users = await userApi.getAll();
      set({ users, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await userApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = await userApi.create(data);
      set((s) => ({ users: [...s.users, user], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await userApi.update(data);
      set((s) => ({
        users: s.users.map((item) => (item.id === updated.id ? updated : item)),
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
      await userApi.remove(id);
      set((s) => ({
        users: s.users.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (user) => set({ selected: user }),
  clearError: () => set({ error: null }),
}));
