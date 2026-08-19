import { create } from "zustand";
import { payrollRateApi } from "../services/payroll-rate.api";
import type { PayrollRateResponse } from "../models/api/response/payroll-rate-response.model";
import type { CreatePayrollRate } from "../models/api/request/create-payroll-rate.model";
import type { UpdatePayrollRate } from "../models/api/request/update-payroll-rate.model";

interface PayrollRateStore {
  rates: PayrollRateResponse[];
  selected: PayrollRateResponse | null;
  loading: boolean;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreatePayrollRate) => Promise<void>;
  update: (data: UpdatePayrollRate) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (rate: PayrollRateResponse | null) => void;
}

export const usePayrollRateStore = create<PayrollRateStore>((set) => ({
  rates: [],
  selected: null,
  loading: false,
  loadAll: async () => {
    set({ loading: true });
    try {
      const rates = await payrollRateApi.getAll();
      set({ rates, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  loadById: async (id) => {
    set({ loading: true });
    try {
      const selected = await payrollRateApi.getById(id);
      set({ selected, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  add: async (data) => {
    set({ loading: true });
    try {
      const rate = await payrollRateApi.create(data);
      set((s) => ({ rates: [...s.rates, rate], loading: false }));
    } catch {
      set({ loading: false });
    }
  },
  update: async (data) => {
    set({ loading: true });
    try {
      const updated = await payrollRateApi.update(data);
      set((s) => ({
        rates: s.rates.map((r) => (r.id === data.id ? updated : r)),
        selected: updated,
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },
  remove: async (id) => {
    set({ loading: true });
    try {
      await payrollRateApi.remove(id);
      set((s) => ({
        rates: s.rates.filter((r) => r.id !== id),
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },
  setSelected: (rate) => set({ selected: rate }),
}));
