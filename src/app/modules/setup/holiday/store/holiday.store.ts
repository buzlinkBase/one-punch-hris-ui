import { create } from 'zustand';
import { holidayApi } from '../services/holiday.api';
import type { HolidayResponse } from '../models/api/response/holiday-response.model';
import type { CreateHoliday } from '../models/api/request/create-holiday.model';
import type { UpdateHoliday } from '../models/api/request/update-holiday.model';

interface HolidayStore {
  holidays: HolidayResponse[];
  selected: HolidayResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateHoliday) => Promise<void>;
  update: (data: UpdateHoliday) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (holiday: HolidayResponse | null) => void;
  clearError: () => void;
}

export const useHolidayStore = create<HolidayStore>((set) => ({
  holidays: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const holidays = await holidayApi.getAll();
      set({ holidays, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await holidayApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const holiday = await holidayApi.create(data);
      set((s) => ({ holidays: [...s.holidays, holiday], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await holidayApi.update(data);
      set((s) => ({
        holidays: s.holidays.map((h) => (h.id === updated.id ? updated : h)),
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
      await holidayApi.remove(id);
      set((s) => ({ holidays: s.holidays.filter((h) => h.id !== id), loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  setSelected: (holiday) => set({ selected: holiday }),
  clearError: () => set({ error: null }),
}));
