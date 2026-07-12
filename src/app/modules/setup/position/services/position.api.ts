import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PositionResponse } from "../models/api/response/position-response.model";
import type { CreatePosition } from "../models/api/request/create-position.model";
import type { UpdatePosition } from "../models/api/request/update-position.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "positions");

export const positionApi = {
  getAll(): Promise<PositionResponse[]> {
    return httpClient.getUnwrapped<PositionResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<PositionResponse> {
    return httpClient.getUnwrapped<PositionResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreatePosition): Promise<PositionResponse> {
    return httpClient.postUnwrapped<PositionResponse>(ENDPOINT, data);
  },
  update(data: UpdatePosition): Promise<PositionResponse> {
    return httpClient.put<PositionResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
