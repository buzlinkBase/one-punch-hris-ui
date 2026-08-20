import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PhicTableResponse } from "../models/api/response/phic-table-response.model";
import type { CreatePhicTable } from "../models/api/request/create-phic-table.model";
import type { UpdatePhicTable } from "../models/api/request/update-phic-table.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "PHICs");

export const phicTableApi = {
  getAll(effectivity: string): Promise<PhicTableResponse[]> {
    return httpClient.getUnwrapped<PhicTableResponse[]>(
      `${ENDPOINT}?effectivity=${effectivity}`,
    );
  },
  getById(id: string): Promise<PhicTableResponse> {
    return httpClient.getUnwrapped<PhicTableResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreatePhicTable): Promise<PhicTableResponse> {
    return httpClient.postUnwrapped<PhicTableResponse>(ENDPOINT, data);
  },
  update(data: UpdatePhicTable): Promise<PhicTableResponse> {
    return httpClient.put<PhicTableResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
