import { create } from "zustand";
import type { DtrSummaryResponse } from "../models/api/response/dtr-summary-response.model";

interface DtrSummaryStore {
  selected: DtrSummaryResponse | null;
  setSelected: (record: DtrSummaryResponse | null) => void;
}

export const useDtrSummaryStore = create<DtrSummaryStore>((set) => ({
  selected: null,
  setSelected: (record) => set({ selected: record }),
}));
