import { create } from "zustand";

// Two independent signals, kept separate since they need different messaging: the browser
// itself reports no network (navigator.onLine / online/offline events) vs. an API call that
// got no response at all (a service is down, DNS/CORS failure, timeout) even though the browser
// thinks it's online. Either one should surface the connection banner. The second is tracked
// per service (see service-registry.ts) so the banner can say which one is down, and one
// service answering again clears only itself.
interface ConnectionStore {
  isOffline: boolean;
  unreachableServices: string[];
  setOffline: (value: boolean) => void;
  markUnreachable: (service: string) => void;
  markReachable: (service: string) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
  unreachableServices: [],
  setOffline: (value) => set({ isOffline: value }),
  markUnreachable: (service) =>
    set((s) =>
      s.unreachableServices.includes(service)
        ? s
        : { unreachableServices: [...s.unreachableServices, service] },
    ),
  markReachable: (service) =>
    set((s) =>
      s.unreachableServices.includes(service)
        ? {
            unreachableServices: s.unreachableServices.filter(
              (k) => k !== service,
            ),
          }
        : s,
    ),
}));
