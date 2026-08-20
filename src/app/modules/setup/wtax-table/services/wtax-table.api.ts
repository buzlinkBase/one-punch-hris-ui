import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { WtaxTableResponse } from "../models/api/response/wtax-table-response.model";
import type { CreateWtaxTable } from "../models/api/request/create-wtax-table.model";
import type { UpdateWtaxTable } from "../models/api/request/update-wtax-table.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "WTaxs");

export const wtaxTableApi = {
  getAll(
    effectivity: string,
    payrollType: string,
  ): Promise<WtaxTableResponse[]> {
    return httpClient.getUnwrapped<WtaxTableResponse[]>(
      `${ENDPOINT}?effectivity=${effectivity}&payrollType=${payrollType}`,
    );
  },
  getById(id: string): Promise<WtaxTableResponse> {
    return httpClient.getUnwrapped<WtaxTableResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreateWtaxTable): Promise<WtaxTableResponse> {
    return httpClient.postUnwrapped<WtaxTableResponse>(ENDPOINT, data);
  },
  update(data: UpdateWtaxTable): Promise<WtaxTableResponse> {
    return httpClient.put<WtaxTableResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
