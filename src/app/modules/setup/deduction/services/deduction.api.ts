import httpClient from "@/core/http/http-client";
import type { DeductionResponse } from "../models/api/response/deduction-response.model";
import type { CreateDeduction } from "../models/api/request/create-deduction.model";
import type { UpdateDeduction } from "../models/api/request/update-deduction.model";

const ENDPOINT = "deductions";

const MOCK_DEDUCTIONS: DeductionResponse[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `deduction-${i + 1}`,
    code: `DED${String(i + 1).padStart(3, "0")}`,
    name: `Deduction ${i + 1}`,
    deductionTypeId: `dt-${(i % 8) + 1}`,
    amount: parseFloat(((i + 1) * 50).toFixed(2)),
    status: i % 5 === 0 ? "INACTIVE" : "ACTIVE",
  }),
);

export const deductionApi = {
  async getAll(): Promise<DeductionResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<DeductionResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_DEDUCTIONS;
    } catch {
      return MOCK_DEDUCTIONS;
    }
  },

  async getById(id: string): Promise<DeductionResponse> {
    try {
      return await httpClient.getUnwrapped<DeductionResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_DEDUCTIONS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Deduction ${id} not found`);
    }
  },

  create(data: CreateDeduction): Promise<DeductionResponse> {
    return httpClient.postUnwrapped<DeductionResponse>(ENDPOINT, data);
  },

  update(data: UpdateDeduction): Promise<DeductionResponse> {
    return httpClient.put<DeductionResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
