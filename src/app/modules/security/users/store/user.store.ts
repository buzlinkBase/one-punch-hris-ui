import { create } from "zustand";
import { userApi } from "../services/user.api";
import type { UserResponse } from "../models/api/response/user-response.model";

interface UserStore {
  users: UserResponse[];
  selected: UserResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
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

  setSelected: (user) => set({ selected: user }),
  clearError: () => set({ error: null }),
}));
