import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { CreateClient } from "../models/api/request/create-client.model";
import type { DeactivateClient } from "../models/api/request/deactivate-client.model";
import type { UpdateClient } from "../models/api/request/update-client.model";
import type { ClientResponse } from "../models/api/response/client-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "clients");

const INITIAL_CLIENTS: ClientResponse[] = Array.from(
  { length: 18 },
  (_, index) => ({
    id: `client-${1001 + index}`,
    clientCode: `CLT-${1001 + index}`,
    clientName: `Client ${index + 1}`,
    contactPerson: `Contact Person ${index + 1}`,
    contactNumber: `0917-555-${String(1000 + index).slice(-4)}`,
    email: `client${index + 1}@onepunch.local`,
    address: `${index + 1} Sample Street, Metro Manila`,
    unpaidDues: index % 4 === 0 ? 12500 : index % 3 === 0 ? 3200 : 0,
    status: index % 5 === 0 ? "INACTIVE" : "ACTIVE",
    deactivationReason: index % 5 === 0 ? "UNPAID_DUES" : undefined,
    deactivatedAt:
      index % 5 === 0 ? new Date(2026, 0, index + 1).toISOString() : undefined,
  }),
);

let mockClients = [...INITIAL_CLIENTS];

const cloneClient = (client: ClientResponse): ClientResponse => ({ ...client });

const nextClientId = () => `client-${Date.now()}`;

const createMockClient = (data: CreateClient): ClientResponse => {
  const client: ClientResponse = {
    id: nextClientId(),
    ...data,
    status: "ACTIVE",
  };

  mockClients = [client, ...mockClients];
  return cloneClient(client);
};

const updateMockClient = (data: UpdateClient): ClientResponse => {
  const existing = mockClients.find((client) => client.id === data.id);

  if (!existing) {
    throw new Error(`Client ${data.id} not found`);
  }

  const updated: ClientResponse = {
    ...existing,
    ...data,
    id: existing.id,
  };

  mockClients = mockClients.map((client) =>
    client.id === updated.id ? updated : client,
  );

  return cloneClient(updated);
};

const deactivateMockClient = (data: DeactivateClient): ClientResponse => {
  const existing = mockClients.find((client) => client.id === data.id);

  if (!existing) {
    throw new Error(`Client ${data.id} not found`);
  }

  const updated: ClientResponse = {
    ...existing,
    status: "INACTIVE",
    deactivationReason: data.deactivationReason,
    deactivatedAt: new Date().toISOString(),
  };

  mockClients = mockClients.map((client) =>
    client.id === updated.id ? updated : client,
  );

  return cloneClient(updated);
};

export const clientApi = {
  async getAll(): Promise<ClientResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<ClientResponse[]>(ENDPOINT);
      return data.length ? data : mockClients.map(cloneClient);
    } catch {
      return mockClients.map(cloneClient);
    }
  },

  async getById(id: string): Promise<ClientResponse> {
    try {
      return await httpClient.getUnwrapped<ClientResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = mockClients.find((client) => client.id === id);

      if (match) {
        return cloneClient(match);
      }

      throw new Error(`Client ${id} not found`);
    }
  },

  async create(data: CreateClient): Promise<ClientResponse> {
    try {
      return await httpClient.postUnwrapped<ClientResponse>(ENDPOINT, data);
    } catch {
      return createMockClient(data);
    }
  },

  async update(data: UpdateClient): Promise<ClientResponse> {
    try {
      return await httpClient.put<ClientResponse>(
        `${ENDPOINT}/${data.id}`,
        data,
      );
    } catch {
      return updateMockClient(data);
    }
  },

  async deactivate(data: DeactivateClient): Promise<ClientResponse> {
    try {
      return await httpClient.patch<ClientResponse>(`${ENDPOINT}/${data.id}`, {
        status: "INACTIVE",
        deactivationReason: data.deactivationReason,
      });
    } catch {
      return deactivateMockClient(data);
    }
  },
};
