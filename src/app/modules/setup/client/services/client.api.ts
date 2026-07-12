import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ClientResponse } from "../models/api/response/client-response.model";
import type { CreateClient } from "../models/api/request/create-client.model";
import type { UpdateClient } from "../models/api/request/update-client.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "clients");

export const clientApi = {
  getAll(): Promise<ClientResponse[]> {
    return httpClient.getUnwrapped<ClientResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<ClientResponse> {
    return httpClient.getUnwrapped<ClientResponse>(`${ENDPOINT}/${id}`);
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
