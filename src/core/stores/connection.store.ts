import { create } from "zustand";

// Two independent signals, kept separate since they need different messaging: the browser
// itself reports no network (navigator.onLine / online/offline events) vs. an API call that
// got no response at all (server down, DNS/CORS failure, timeout) even though the browser
// thinks it's online. Either one should surface the connection banner.
interface ConnectionStore {
  isOffline: boolean;
  isServerUnreachable: boolean;
  setOffline: (value: boolean) => void;
  setServerUnreachable: (value: boolean) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
  isServerUnreachable: false,
  setOffline: (value) => set({ isOffline: value }),
  setServerUnreachable: (value) => set({ isServerUnreachable: value }),
}));
