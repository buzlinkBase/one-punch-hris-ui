import { create } from "zustand";
import { sectionApi } from "../services/section.api";
import type { SectionResponse } from "../models/api/response/section-response.model";
import type { CreateSection } from "../models/api/request/create-section.model";
import type { UpdateSection } from "../models/api/request/update-section.model";

interface SectionStore {
  sections: SectionResponse[];
  selected: SectionResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateSection) => Promise<void>;
  update: (data: UpdateSection) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (section: SectionResponse | null) => void;
  clearError: () => void;
}

export const useSectionStore = create<SectionStore>((set) => ({
  sections: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const sections = await sectionApi.getAll();
      set({ sections, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await sectionApi.getById(id);
      set({ selected, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const section = await sectionApi.create(data);
      set((s) => ({ sections: [...s.sections, section], loading: false }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await sectionApi.update(data);
      set((s) => ({
        sections: s.sections.map((sec) =>
          sec.id === updated.id ? updated : sec,
        ),
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
      await sectionApi.remove(id);
      set((s) => ({
        sections: s.sections.filter((sec) => sec.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },
  setSelected: (section) => set({ selected: section }),
  clearError: () => set({ error: null }),
}));
