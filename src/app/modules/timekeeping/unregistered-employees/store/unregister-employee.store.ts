import { create } from "zustand";
import { unregisterEmployeeApi } from "../services/unregister-employee.api";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";
import type { UnregisterEmployeeResponse } from "../models/api/response/unregister-employee-response.model";

interface UnregisterEmployeeStore {
  employees: UnregisterEmployeeResponse[];
  selected: UnregisterEmployeeResponse | null;
  loading: boolean;
  error: string | null;
  filters: UnregisterEmployeeFilter;
  loadAll: (filter?: UnregisterEmployeeFilter) => Promise<void>;
  register: (employeeId: string) => Promise<void>;
  unregister: (employeeId: string) => Promise<void>;
  setSelected: (employee: UnregisterEmployeeResponse | null) => void;
  setFilters: (filters: UnregisterEmployeeFilter) => void;
  clearError: () => void;
}

export const useUnregisterEmployeeStore = create<UnregisterEmployeeStore>(
  (set) => ({
    employees: [],
    selected: null,
    loading: false,
    error: null,
    filters: {},

    loadAll: async (filter = {}) => {
      set({ loading: true, error: null });

      try {
        const employees = await unregisterEmployeeApi.getAll(filter);
        set({ employees, filters: filter, loading: false });
      } catch (err) {
        set({ error: String(err), loading: false });
      }
    },

    register: async (employeeId) => {
      set({ loading: true, error: null });

      try {
        const updated =
          await unregisterEmployeeApi.registerEmployee(employeeId);
        set((state) => ({
          employees: state.employees.map((item) =>
            item.employeeId === updated.employeeId ? updated : item,
          ),
          selected:
            state.selected?.employeeId === updated.employeeId
              ? updated
              : state.selected,
          loading: false,
        }));
      } catch (err) {
        set({ error: String(err), loading: false });
      }
    },

    unregister: async (employeeId) => {
      set({ loading: true, error: null });

      try {
        const updated =
          await unregisterEmployeeApi.unregisterEmployee(employeeId);
        set((state) => ({
          employees: state.employees.map((item) =>
            item.employeeId === updated.employeeId ? updated : item,
          ),
          selected:
            state.selected?.employeeId === updated.employeeId
              ? updated
              : state.selected,
          loading: false,
        }));
      } catch (err) {
        set({ error: String(err), loading: false });
      }
    },

    setSelected: (employee) => set({ selected: employee }),
    setFilters: (filters) => set({ filters }),
    clearError: () => set({ error: null }),
  }),
);
