import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { OperationAreaResponse } from "../models/api/response/operation-area-response.model";
import type { CreateOperationArea } from "../models/api/request/create-operation-area.model";
import type { UpdateOperationArea } from "../models/api/request/update-operation-area.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "costcenters");

const MOCK_OPERATION_AREAS: OperationAreaResponse[] = Array.from(
  { length: 24 },
  (_, i) => ({
    id: `op-${i + 1}`,
    code: `OP${String(i + 1).padStart(3, "0")}`,
    name: `Operation Area ${i + 1}`,
    status: i % 6 === 0 ? "INACTIVE" : "ACTIVE",
  }),
);

export const operationAreaApi = {
  async getAll(): Promise<OperationAreaResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<OperationAreaResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_OPERATION_AREAS;
    } catch {
      return MOCK_OPERATION_AREAS;
    }
  },
  async getById(id: string): Promise<OperationAreaResponse> {
    try {
      return await httpClient.getUnwrapped<OperationAreaResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_OPERATION_AREAS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Operation area ${id} not found`);
    }
  },
  create(data: CreateOperationArea): Promise<OperationAreaResponse> {
    return httpClient.postUnwrapped<OperationAreaResponse>(ENDPOINT, data);
  },
  update(data: UpdateOperationArea): Promise<OperationAreaResponse> {
    return httpClient.put<OperationAreaResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
