import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ClientResponse } from "../models/api/response/client-response.model";
import type { CreateClient } from "../models/api/request/create-client.model";
import type { UpdateClient } from "../models/api/request/update-client.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "clients");

const MOCK_CLIENTS: ClientResponse[] = Array.from({ length: 12 }, (_, i) => ({
  id: `client-${i + 1}`,
  code: `CLT${String(i + 1).padStart(3, "0")}`,
  name: `Client ${i + 1}`,
  status: i % 5 === 0 ? "INACTIVE" : "ACTIVE",
}));

export const clientApi = {
  async getAll(): Promise<ClientResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<ClientResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_CLIENTS;
    } catch {
      return MOCK_CLIENTS;
    }
  },
  async getById(id: string): Promise<ClientResponse> {
    try {
      return await httpClient.getUnwrapped<ClientResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = MOCK_CLIENTS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Client ${id} not found`);
    }
  },
  create(data: CreateClient): Promise<ClientResponse> {
    return httpClient.postUnwrapped<ClientResponse>(ENDPOINT, data);
  },
  update(data: UpdateClient): Promise<ClientResponse> {
    return httpClient.put<ClientResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
