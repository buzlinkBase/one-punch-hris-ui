import { create } from "zustand";
import { uploadAttendanceApi } from "../services/upload-attendance.api";
import type { UploadAttendanceFilter } from "../models/api/request/upload-attendance-filter.model";
import type { UploadAttendanceResponse } from "../models/api/response/upload-attendance-response.model";

interface UploadAttendanceStore {
  records: UploadAttendanceResponse[];
  selected: UploadAttendanceResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: (filter?: UploadAttendanceFilter) => Promise<void>;
  upload: (file: File) => Promise<void>;
  setSelected: (record: UploadAttendanceResponse | null) => void;
  clearError: () => void;
}

export const useUploadAttendanceStore = create<UploadAttendanceStore>(
  (set) => ({
    records: [],
    selected: null,
    loading: false,
    error: null,

    loadAll: async (filter = {}) => {
      set({ loading: true, error: null });

      try {
        const records = await uploadAttendanceApi.getAll(filter);
        set({ records, loading: false });
      } catch (err) {
        set({ error: String(err), loading: false });
      }
    },

    upload: async (file) => {
      set({ loading: true, error: null });

      try {
        const uploaded = await uploadAttendanceApi.uploadRawLog(file);
        set((state) => ({
          records: [...uploaded, ...state.records],
          loading: false,
        }));
      } catch (err) {
        set({ error: String(err), loading: false });
      }
    },

    setSelected: (record) => set({ selected: record }),
    clearError: () => set({ error: null }),
  }),
);
