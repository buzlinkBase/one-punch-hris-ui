import { create } from "zustand";
import { changeHolidayApi } from "../services/change-holiday.api";
import type { ChangeHolidayResponse } from "../models/api/response/change-holiday-response.model";
import type { CreateChangeHoliday } from "../models/api/request/create-change-holiday.model";
import type { UpdateChangeHoliday } from "../models/api/request/update-change-holiday.model";

interface ChangeHolidayStore {
  records: ChangeHolidayResponse[];
  selected: ChangeHolidayResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateChangeHoliday) => Promise<void>;
  update: (data: UpdateChangeHoliday) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (record: ChangeHolidayResponse | null) => void;
  clearError: () => void;
}

export const useChangeHolidayStore = create<ChangeHolidayStore>((set) => ({
  records: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const records = await changeHolidayApi.getAll();
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await changeHolidayApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const record = await changeHolidayApi.create(data);
      set((s) => ({ records: [...s.records, record], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await changeHolidayApi.update(data);
      set((s) => ({
        records: s.records.map((r) =>
          r.batchId === updated.batchId ? updated : r,
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
      await changeHolidayApi.remove(id);
      set((s) => ({
        records: s.records.filter((r) => r.batchId !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (record) => set({ selected: record }),
  clearError: () => set({ error: null }),
}));
