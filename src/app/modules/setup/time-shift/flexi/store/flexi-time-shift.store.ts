import { create } from "zustand";
import { flexiTimeShiftApi } from "../services/flexi-time-shift.api";
import type { FlexiTimeShiftResponse } from "../models/api/response/flexi-time-shift-response.model";
import type { CreateFlexiTimeShift } from "../models/api/request/create-flexi-time-shift.model";
import type { UpdateFlexiTimeShift } from "../models/api/request/update-flexi-time-shift.model";

interface FlexiTimeShiftStore {
  shifts: FlexiTimeShiftResponse[];
  selected: FlexiTimeShiftResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateFlexiTimeShift) => Promise<void>;
  update: (data: UpdateFlexiTimeShift) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (shift: FlexiTimeShiftResponse | null) => void;
  clearError: () => void;
}

export const useFlexiTimeShiftStore = create<FlexiTimeShiftStore>((set) => ({
  shifts: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const shifts = await flexiTimeShiftApi.getAll();
      set({ shifts, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await flexiTimeShiftApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const shift = await flexiTimeShiftApi.create(data);
      set((s) => ({ shifts: [...s.shifts, shift], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await flexiTimeShiftApi.update(data);
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
      await flexiTimeShiftApi.remove(id);
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
