import { create } from "zustand";
import { changeRestDayApi } from "../services/change-rest-day.api";
import type { ChangeRestDayResponse } from "../models/api/response/change-rest-day-response.model";
import type { CreateChangeRestDay } from "../models/api/request/create-change-rest-day.model";
import type { UpdateChangeRestDay } from "../models/api/request/update-change-rest-day.model";

interface ChangeRestDayStore {
  records: ChangeRestDayResponse[];
  selected: ChangeRestDayResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateChangeRestDay) => Promise<void>;
  update: (data: UpdateChangeRestDay) => Promise<void>;
  remove: (batchCode: string) => Promise<void>;
  setSelected: (record: ChangeRestDayResponse | null) => void;
  clearError: () => void;
}

export const useChangeRestDayStore = create<ChangeRestDayStore>((set) => ({
  records: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const records = await changeRestDayApi.getAll();
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await changeRestDayApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      await changeRestDayApi.create(data);
      const records = await changeRestDayApi.getAll();
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      await changeRestDayApi.update(data);
      const records = await changeRestDayApi.getAll();
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  remove: async (batchCode) => {
    set({ loading: true, error: null });
    try {
      await changeRestDayApi.removeBatch(batchCode);
      set((s) => ({
        records: s.records.filter((r) => r.batchCode !== batchCode),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (record) => set({ selected: record }),
  clearError: () => set({ error: null }),
}));
