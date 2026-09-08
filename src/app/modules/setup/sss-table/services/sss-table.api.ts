import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { SssTableResponse } from "../models/api/response/sss-table-response.model";
import type { CreateSssTable } from "../models/api/request/create-sss-table.model";
import type { UpdateSssTable } from "../models/api/request/update-sss-table.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "SSS");

export const sssTableApi = {
  getAll(): Promise<SssTableResponse[]> {
    return httpClient.getUnwrapped<SssTableResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<SssTableResponse> {
    return httpClient.getUnwrapped<SssTableResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreateSssTable): Promise<SssTableResponse> {
    return httpClient.postUnwrapped<SssTableResponse>(ENDPOINT, data);
  },
  update(data: UpdateSssTable): Promise<SssTableResponse> {
    return httpClient.put<SssTableResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
