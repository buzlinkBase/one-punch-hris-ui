import { create } from 'zustand';
import { clientApi } from '../services/client.api';
import type { ClientResponse } from '../models/api/response/client-response.model';
import type { CreateClient } from '../models/api/request/create-client.model';
import type { UpdateClient } from '../models/api/request/update-client.model';

interface ClientStore {
  clients: ClientResponse[];
  selected: ClientResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateClient) => Promise<void>;
  update: (data: UpdateClient) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setSelected: (client: ClientResponse | null) => void;
  clearError: () => void;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  selected: null,
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const clients = await clientApi.getAll();
      set({ clients, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await clientApi.getById(id);
      set({ selected, loading: false });
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const client = await clientApi.create(data);
      set((s) => ({ clients: [...s.clients, client], loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await clientApi.update(data);
      set((s) => ({
        clients: s.clients.map((c) => (c.id === updated.id ? updated : c)),
        selected: updated,
        loading: false,
      }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await clientApi.remove(id);
      set((s) => ({ clients: s.clients.filter((c) => c.id !== id), loading: false }));
    } catch (err) { set({ error: String(err), loading: false }); }
  },
  setSelected: (client) => set({ selected: client }),
  clearError: () => set({ error: null }),
}));
