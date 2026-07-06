import { create } from "zustand";
import { auditApi } from "../services/audit.api";
import type { AuditResponse } from "../models/api/response/audit-response.model";

interface AuditStore {
  audits: AuditResponse[];
  selected: AuditResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  setSelected: (audit: AuditResponse | null) => void;
  clearError: () => void;
}

export const useAuditStore = create<AuditStore>((set) => ({
  audits: [],
  selected: null,
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const audits = await auditApi.getAll();
      set({ audits, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await auditApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setSelected: (audit) => set({ selected: audit }),
  clearError: () => set({ error: null }),
}));
