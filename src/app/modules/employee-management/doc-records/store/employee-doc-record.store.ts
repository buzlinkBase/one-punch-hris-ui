import { create } from "zustand";
import type { EmployeeDocRecordResponse } from "../models/api/response/employee-doc-record-response.model";
import { employeeDocRecordApi } from "../services/employee-doc-record.api";

interface EmployeeDocRecordState {
  items: EmployeeDocRecordResponse[];
  selected: EmployeeDocRecordResponse | null;
  loading: boolean;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: Omit<EmployeeDocRecordResponse, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: EmployeeDocRecordResponse | null) => void;
}

export const useEmployeeDocRecordStore = create<EmployeeDocRecordState>((set) => ({
  items: [],
  selected: null,
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    const items = await employeeDocRecordApi.getAll();
    set({ items, loading: false });
  },

  loadById: async (id) => {
    set({ loading: true });
    const selected = await employeeDocRecordApi.getById(id);
    set({ selected, loading: false });
  },

  add: async (data) => {
    const created = await employeeDocRecordApi.create(data);
    set((state) => ({ items: [...state.items, created] }));
  },

  remove: async (id) => {
    await employeeDocRecordApi.remove(id);
    set((state) => ({ items: state.items.filter((r) => r.id !== id) }));
  },

  setSelected: (selected) => set({ selected }),
}));
