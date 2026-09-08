import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { AnnualTaxTableResponse } from "../models/api/response/annual-tax-table-response.model";
import type { CreateAnnualTaxTable } from "../models/api/request/create-annual-tax-table.model";
import type { UpdateAnnualTaxTable } from "../models/api/request/update-annual-tax-table.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "AnnualTaxs");

export const annualTaxTableApi = {
  getAll(): Promise<AnnualTaxTableResponse[]> {
    return httpClient.getUnwrapped<AnnualTaxTableResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<AnnualTaxTableResponse> {
    return httpClient.getUnwrapped<AnnualTaxTableResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreateAnnualTaxTable): Promise<AnnualTaxTableResponse> {
    return httpClient.postUnwrapped<AnnualTaxTableResponse>(ENDPOINT, data);
  },
  update(data: UpdateAnnualTaxTable): Promise<AnnualTaxTableResponse> {
    return httpClient.put<AnnualTaxTableResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
