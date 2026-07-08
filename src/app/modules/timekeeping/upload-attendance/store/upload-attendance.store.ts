import { create } from "zustand";
import { uploadAttendanceApi } from "../services/upload-attendance.api";
import type { UploadAttendanceRequest } from "../models/api/request/upload-attendance-request.model";

interface UploadAttendanceStore {
  loading: boolean;
  error: string | null;
  upload: (data: UploadAttendanceRequest) => Promise<void>;
  clearError: () => void;
}

export const useUploadAttendanceStore = create<UploadAttendanceStore>(
  (set) => ({
    loading: false,
    error: null,

    upload: async (data) => {
      set({ loading: true, error: null });
      try {
        await uploadAttendanceApi.upload(data);
        set({ loading: false });
      } catch (err) {
        set({ error: String(err), loading: false });
      }
    },

    clearError: () => set({ error: null }),
  }),
);
