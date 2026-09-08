import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { HdmfTableResponse } from "../models/api/response/hdmf-table-response.model";
import type { CreateHdmfTable } from "../models/api/request/create-hdmf-table.model";
import type { UpdateHdmfTable } from "../models/api/request/update-hdmf-table.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "HDMFs");

export const hdmfTableApi = {
  getAll(): Promise<HdmfTableResponse[]> {
    return httpClient.getUnwrapped<HdmfTableResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<HdmfTableResponse> {
    return httpClient.getUnwrapped<HdmfTableResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreateHdmfTable): Promise<HdmfTableResponse> {
    return httpClient.postUnwrapped<HdmfTableResponse>(ENDPOINT, data);
  },
  update(data: UpdateHdmfTable): Promise<HdmfTableResponse> {
    return httpClient.put<HdmfTableResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
