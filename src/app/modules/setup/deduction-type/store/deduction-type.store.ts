import { create } from "zustand";
import { deductionTypeApi } from "../services/deduction-type.api";
import type { DeductionTypeResponse } from "../models/api/response/deduction-type-response.model";
import type { CreateDeductionType } from "../models/api/request/create-deduction-type.model";
import type { UpdateDeductionType } from "../models/api/request/update-deduction-type.model";

interface DeductionTypeStore {
  deductionTypes: DeductionTypeResponse[];
  selected: DeductionTypeResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateDeductionType) => Promise<void>;
  update: (data: UpdateDeductionType) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (item: DeductionTypeResponse | null) => void;
  clearError: () => void;
}

export const useDeductionTypeStore = create<DeductionTypeStore>((set) => ({
  deductionTypes: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const deductionTypes = await deductionTypeApi.getAll();
      set({ deductionTypes, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await deductionTypeApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const item = await deductionTypeApi.create(data);
      set((s) => ({
        deductionTypes: [...s.deductionTypes, item],
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await deductionTypeApi.update(data);
      set((s) => ({
        deductionTypes: s.deductionTypes.map((d) =>
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
      await deductionTypeApi.remove(id);
      set((s) => ({
        deductionTypes: s.deductionTypes.filter((d) => d.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (item) => set({ selected: item }),
  clearError: () => set({ error: null }),
}));
