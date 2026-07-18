import { create } from "zustand";
import { SplitTimeShiftApi } from "../services/split-time-shift.api";
import type { SplitTimeShiftResponse } from "../models/api/response/split-time-shift-response.model";
import type { CreateSplitTimeShift } from "../models/api/request/create-split-time-shift.model";
import type { UpdateSplitTimeShift } from "../models/api/request/update-split-time-shift.model";

interface SplitTimeShiftStore {
  shifts: SplitTimeShiftResponse[];
  selected: SplitTimeShiftResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateSplitTimeShift) => Promise<void>;
  update: (data: UpdateSplitTimeShift) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (shift: SplitTimeShiftResponse | null) => void;
  clearError: () => void;
}

export const useSplitTimeShiftStore = create<SplitTimeShiftStore>((set) => ({
  shifts: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const shifts = await SplitTimeShiftApi.getAll();
      set({ shifts, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await SplitTimeShiftApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const shift = await SplitTimeShiftApi.create(data);
      set((s) => ({ shifts: [...s.shifts, shift], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await SplitTimeShiftApi.update(data);
      set((s) => ({
        shifts: s.shifts.map((sh) => (sh.id === updated.id ? updated : sh)),
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
      await SplitTimeShiftApi.remove(id);
      set((s) => ({
        shifts: s.shifts.filter((sh) => sh.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  setSelected: (shift) => set({ selected: shift }),
  clearError: () => set({ error: null }),
}));
