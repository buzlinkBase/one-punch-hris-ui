import { create } from "zustand";
import { departmentApi } from "../services/department.api";
import type { DepartmentResponse } from "../models/api/response/department-response.model";
import type { CreateDepartment } from "../models/api/request/create-department.model";
import type { UpdateDepartment } from "../models/api/request/update-department.model";

interface DepartmentStore {
  departments: DepartmentResponse[];
  selected: DepartmentResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateDepartment) => Promise<void>;
  update: (data: UpdateDepartment) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (dept: DepartmentResponse | null) => void;
  clearError: () => void;
}

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  departments: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const departments = await departmentApi.getAll();
      set({ departments, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await departmentApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const department = await departmentApi.create(data);
      set((s) => ({
        departments: [...s.departments, department],
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await departmentApi.update(data);
      set((s) => ({
        departments: s.departments.map((d) =>
          d.id === updated.id ? updated : d,
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
      await departmentApi.remove(id);
      set((s) => ({
        departments: s.departments.filter((d) => d.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (dept) => set({ selected: dept }),
  clearError: () => set({ error: null }),
}));
