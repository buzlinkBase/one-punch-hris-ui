import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { OperationAreaResponse } from "../models/api/response/operation-area-response.model";
import type { CreateOperationArea } from "../models/api/request/create-operation-area.model";
import type { UpdateOperationArea } from "../models/api/request/update-operation-area.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "costcenters");

export const operationAreaApi = {
  getAll(): Promise<OperationAreaResponse[]> {
    return httpClient.getUnwrapped<OperationAreaResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<OperationAreaResponse> {
    return httpClient.getUnwrapped<OperationAreaResponse>(`${ENDPOINT}/${id}`);
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
