import { create } from "zustand";
import type { CreateClient } from "../models/api/request/create-client.model";
import type { DeactivateClient } from "../models/api/request/deactivate-client.model";
import type { UpdateClient } from "../models/api/request/update-client.model";
import type { ClientResponse } from "../models/api/response/client-response.model";
import { clientApi } from "../services/client.api";

interface ClientStore {
  clients: ClientResponse[];
  selected: ClientResponse | null;
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadById: (id: string) => Promise<void>;
  add: (data: CreateClient) => Promise<void>;
  update: (data: UpdateClient) => Promise<void>;
  deactivate: (data: DeactivateClient) => Promise<void>;
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
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  loadById: async (id) => {
    set({ loading: true, error: null });
    try {
      const selected = await clientApi.getById(id);
      set({ selected, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  add: async (data) => {
    set({ loading: true, error: null });
    try {
      const client = await clientApi.create(data);
      set((state) => ({
        clients: [...state.clients, client],
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  update: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await clientApi.update(data);
      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === updated.id ? updated : client,
        ),
        selected: updated,
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  deactivate: async (data) => {
    set({ loading: true, error: null });
    try {
      const updated = await clientApi.deactivate(data);
      set((state) => ({
        clients: state.clients.map((client) =>
          client.id === updated.id ? updated : client,
        ),
        selected: updated,
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  setSelected: (client) => set({ selected: client }),
  clearError: () => set({ error: null }),
}));
