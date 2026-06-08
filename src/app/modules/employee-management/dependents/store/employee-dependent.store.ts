import { create } from "zustand";
import type { EmployeeDependentResponse } from "../models/api/response/employee-dependent-response.model";
import { employeeDependentApi } from "../services/employee-dependent.api";

interface EmployeeDependentState {
  items: EmployeeDependentResponse[];
  selected: EmployeeDependentResponse | null;
  loading: boolean;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: Omit<EmployeeDependentResponse, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: EmployeeDependentResponse | null) => void;
}

export const useEmployeeDependentStore = create<EmployeeDependentState>((set) => ({
  items: [],
  selected: null,
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    const items = await employeeDependentApi.getAll();
    set({ items, loading: false });
  },

  loadById: async (id) => {
    set({ loading: true });
    const selected = await employeeDependentApi.getById(id);
    set({ selected, loading: false });
  },

  add: async (data) => {
    const created = await employeeDependentApi.create(data);
    set((state) => ({ items: [...state.items, created] }));
  },

  remove: async (id) => {
    await employeeDependentApi.remove(id);
    set((state) => ({ items: state.items.filter((d) => d.id !== id) }));
  },

  setSelected: (selected) => set({ selected }),
}));
