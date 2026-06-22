import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DeductionTypeResponse } from "../models/api/response/deduction-type-response.model";
import type { CreateDeductionType } from "../models/api/request/create-deduction-type.model";
import type { UpdateDeductionType } from "../models/api/request/update-deduction-type.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "deductiontypes");

const MOCK_DEDUCTION_TYPES: DeductionTypeResponse[] = [
  { id: "dt-1", code: "GOV", name: "Government", status: "ACTIVE" },
  { id: "dt-2", code: "COM", name: "Company", status: "ACTIVE" },
  { id: "dt-3", code: "VOL", name: "Voluntary", status: "ACTIVE" },
  { id: "dt-4", code: "SSS", name: "SSS", status: "ACTIVE" },
  { id: "dt-5", code: "PHIC", name: "PhilHealth", status: "ACTIVE" },
  { id: "dt-6", code: "HDMF", name: "Pag-IBIG", status: "ACTIVE" },
  { id: "dt-7", code: "TRD", name: "Tax Deduction", status: "ACTIVE" },
  { id: "dt-8", code: "LN", name: "Loan", status: "ACTIVE" },
];

export const deductionTypeApi = {
  async getAll(): Promise<DeductionTypeResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<DeductionTypeResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_DEDUCTION_TYPES;
    } catch {
      return MOCK_DEDUCTION_TYPES;
    }
  },

  async getById(id: string): Promise<DeductionTypeResponse> {
    try {
      return await httpClient.getUnwrapped<DeductionTypeResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_DEDUCTION_TYPES.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Deduction type ${id} not found`);
    }
  },

  create(data: CreateDeductionType): Promise<DeductionTypeResponse> {
    return httpClient.postUnwrapped<DeductionTypeResponse>(ENDPOINT, data);
  },

  update(data: UpdateDeductionType): Promise<DeductionTypeResponse> {
    return httpClient.put<DeductionTypeResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
