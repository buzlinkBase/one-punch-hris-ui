import { create } from "zustand";
import { employeeApi } from "../services/employee.api";
import type { EmployeeResponse } from "../models/api/response/employee-response.model";
import type { CreateEmployee } from "../models/api/request/create-employee.model";
import type { UpdateEmployee } from "../models/api/request/update-employee.model";

interface EmployeeStore {
  employees: EmployeeResponse[];
  selected: EmployeeResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateEmployee) => Promise<void>;
  update: (data: UpdateEmployee) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (employee: EmployeeResponse | null) => void;
  clearError: () => void;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const employees = await employeeApi.getAll();
      set({ employees, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await employeeApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const employee = await employeeApi.create(data);
      set((s) => ({ employees: [...s.employees, employee], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await employeeApi.update(data);
      set((s) => ({
        employees: s.employees.map((e) => (e.id === updated.id ? updated : e)),
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
      await employeeApi.remove(id);
      set((s) => ({
        employees: s.employees.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (employee) => set({ selected: employee }),
  clearError: () => set({ error: null }),
}));
