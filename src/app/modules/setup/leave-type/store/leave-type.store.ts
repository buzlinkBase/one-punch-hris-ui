import { create } from "zustand";
import type { LeaveTypeResponse } from "../models/api/response/leave-type-response.model";

interface LeaveTypeStore {
  selected: LeaveTypeResponse | null;
  setSelected: (item: LeaveTypeResponse | null) => void;
}

export const useLeaveTypeStore = create<LeaveTypeStore>((set) => ({
  selected: null,
  setSelected: (item) => set({ selected: item }),
}));
