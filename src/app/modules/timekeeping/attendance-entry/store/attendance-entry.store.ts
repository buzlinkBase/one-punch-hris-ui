import { create } from "zustand";
import { attendanceEntryApi } from "../services/attendance-entry.api";
import type { AttendanceEntryFilter } from "../models/api/request/attendance-entry-filter.model";
import type { AttendanceEntryResponse } from "../models/api/response/attendance-entry-response.model";

interface AttendanceEntryStore {
  records: AttendanceEntryResponse[];
  selected: AttendanceEntryResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (filter?: AttendanceEntryFilter) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (record: AttendanceEntryResponse | null) => void;
  clearError: () => void;
}

export const useAttendanceEntryStore = create<AttendanceEntryStore>((set) => ({
  records: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async (filter = {}) => {
    set({ loading: true, error: null });

    try {
      const records = await attendanceEntryApi.getAll(filter);
      set({ records, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });

    try {
      await attendanceEntryApi.remove(id);
      set((state) => ({
        records: state.records.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (record) => set({ selected: record }),
  clearError: () => set({ error: null }),
}));
