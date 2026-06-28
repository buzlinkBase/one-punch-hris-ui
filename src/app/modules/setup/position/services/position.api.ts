import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PositionResponse } from "../models/api/response/position-response.model";
import type { CreatePosition } from "../models/api/request/create-position.model";
import type { UpdatePosition } from "../models/api/request/update-position.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "positions");

const MOCK_POSITIONS: PositionResponse[] = Array.from({ length: 12 }, (_, i) => ({
  id: `position-${i + 1}`,
  code: `POS${String(i + 1).padStart(3, "0")}`,
  name: `Position ${i + 1}`,
  rate: (i + 1) * 500,
  status: i % 5 === 0 ? "INACTIVE" : "ACTIVE",
}));

export const positionApi = {
  async getAll(): Promise<PositionResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<PositionResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_POSITIONS;
    } catch {
      return MOCK_POSITIONS;
    }
  },
  async getById(id: string): Promise<PositionResponse> {
    try {
      return await httpClient.getUnwrapped<PositionResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = MOCK_POSITIONS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Position ${id} not found`);
    }
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
