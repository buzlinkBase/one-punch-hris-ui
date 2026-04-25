import { create } from 'zustand';
import { payrollGroupApi } from '../services/payroll-group.api';
import type { PayrollGroupResponse } from '../models/api/response/payroll-group-response.model';
import type { CreatePayrollGroup } from '../models/api/request/create-payroll-group.model';
import type { UpdatePayrollGroup } from '../models/api/request/update-payroll-group.model';

interface PayrollGroupStore {
  payrollGroups: PayrollGroupResponse[];
  selected: PayrollGroupResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreatePayrollGroup) => Promise<void>;
  update: (data: UpdatePayrollGroup) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (group: PayrollGroupResponse | null) => void;
  clearError: () => void;
}

export const usePayrollGroupStore = create<PayrollGroupStore>((set) => ({
  payrollGroups: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const payrollGroups = await payrollGroupApi.getAll();
      set({ payrollGroups, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await payrollGroupApi.getById(id);
      set({ selected, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const group = await payrollGroupApi.create(data);
      set((s) => ({ payrollGroups: [...s.payrollGroups, group], loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await payrollGroupApi.update(data);
      set((s) => ({
        payrollGroups: s.payrollGroups.map((g) => (g.id === updated.id ? updated : g)),
        selected: updated,
        loading: false,
      }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await payrollGroupApi.remove(id);
      set((s) => ({ payrollGroups: s.payrollGroups.filter((g) => g.id !== id), loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  setSelected: (group) => set({ selected: group }),
  clearError: () => set({ error: null }),
}));
