import { create } from "zustand";
import { rawLogsApi } from "../services/raw-logs.api";
import type {
  RawAttendanceLog,
  RawColumnarAttendanceLog,
  CleanAttendanceLogRow,
  CleanAttendanceLogColumnar,
  RawLogsFilterRequest,
} from "../models/api/response/raw-attendance-log.model";

interface RawLogsStore {
  rawAttendanceLogs: RawAttendanceLog[];
  rawColumnarLogs: RawColumnarAttendanceLog[];
  cleanRowLogs: CleanAttendanceLogRow[];
  cleanColumnarLogs: CleanAttendanceLogColumnar[];
  loading: boolean;
  error: string | null;
  filters: RawLogsFilterRequest;
  loadAll: (filters?: RawLogsFilterRequest) => Promise<void>;
  setFilters: (filters: RawLogsFilterRequest) => void;
  clearError: () => void;
}

export const useRawLogsStore = create<RawLogsStore>((set) => ({
  rawAttendanceLogs: [],
  rawColumnarLogs: [],
  cleanRowLogs: [],
  cleanColumnarLogs: [],
  loading: false,
  error: null,
  filters: {},

  loadAll: async (filters) => {
    set({ loading: true, error: null });
    try {
      const data = await rawLogsApi.getAll(filters);
      set({
        rawAttendanceLogs: data.rawAttendanceLogs,
        rawColumnarLogs: data.rawColumnarLogs,
        cleanRowLogs: data.cleanRowLogs,
        cleanColumnarLogs: data.cleanColumnarLogs,
        filters: filters || {},
        loading: false,
      });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setFilters: (filters) => set({ filters }),
  clearError: () => set({ error: null }),
}));
