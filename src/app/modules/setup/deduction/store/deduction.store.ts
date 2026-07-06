import { create } from "zustand";
import { deductionApi } from "../services/deduction.api";
import type { DeductionResponse } from "../models/api/response/deduction-response.model";
import type { CreateDeduction } from "../models/api/request/create-deduction.model";
import type { UpdateDeduction } from "../models/api/request/update-deduction.model";

interface DeductionStore {
  deductions: DeductionResponse[];
  selected: DeductionResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateDeduction) => Promise<void>;
  update: (data: UpdateDeduction) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: DeductionResponse | null) => void;
  clearError: () => void;
}

export const useDeductionStore = create<DeductionStore>((set) => ({
  deductions: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const deductions = await deductionApi.getAll();
      set({ deductions, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await deductionApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const deduction = await deductionApi.create(data);
      set((s) => ({
        deductions: [...s.deductions, deduction],
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await deductionApi.update(data);
      set((s) => ({
        deductions: s.deductions.map((d) =>
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
      await deductionApi.remove(id);
      set((s) => ({
        deductions: s.deductions.filter((d) => d.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (item) => set({ selected: item }),
  clearError: () => set({ error: null }),
}));
