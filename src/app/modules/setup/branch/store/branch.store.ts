import { create } from 'zustand';
import { branchApi } from '../services/branch.api';
import type { BranchResponse } from '../models/api/response/branch-response.model';
import type { CreateBranch } from '../models/api/request/create-branch.model';
import type { UpdateBranch } from '../models/api/request/update-branch.model';

interface BranchStore {
  branches: BranchResponse[];
  selected: BranchResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateBranch) => Promise<void>;
  update: (data: UpdateBranch) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (branch: BranchResponse | null) => void;
  clearError: () => void;
}

export const useBranchStore = create<BranchStore>((set) => ({
  branches: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const branches = await branchApi.getAll();
      set({ branches, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await branchApi.getById(id);
      set({ selected, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const branch = await branchApi.create(data);
      set((s) => ({ branches: [...s.branches, branch], loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await branchApi.update(data);
      set((s) => ({
        branches: s.branches.map((b) => (b.id === updated.id ? updated : b)),
        selected: updated,
        loading: false,
      }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await branchApi.remove(id);
      set((s) => ({ branches: s.branches.filter((b) => b.id !== id), loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  setSelected: (branch) => set({ selected: branch }),
  clearError: () => set({ error: null }),
}));
