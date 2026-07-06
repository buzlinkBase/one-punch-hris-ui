import { create } from "zustand";
import { fixedTimeShiftApi } from "../services/fixed-time-shift.api";
import type { FixedTimeShiftResponse } from "../models/api/response/fixed-time-shift-response.model";
import type { CreateFixedTimeShift } from "../models/api/request/create-fixed-time-shift.model";
import type { UpdateFixedTimeShift } from "../models/api/request/update-fixed-time-shift.model";

interface FixedTimeShiftStore {
  shifts: FixedTimeShiftResponse[];
  selected: FixedTimeShiftResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateFixedTimeShift) => Promise<void>;
  update: (data: UpdateFixedTimeShift) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (shift: FixedTimeShiftResponse | null) => void;
  clearError: () => void;
}

export const useFixedTimeShiftStore = create<FixedTimeShiftStore>((set) => ({
  shifts: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const shifts = await fixedTimeShiftApi.getAll();
      set({ shifts, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await fixedTimeShiftApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const shift = await fixedTimeShiftApi.create(data);
      set((s) => ({ shifts: [...s.shifts, shift], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await fixedTimeShiftApi.update(data);
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
      await fixedTimeShiftApi.remove(id);
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
