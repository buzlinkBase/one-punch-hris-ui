import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { WorkRotationResponse } from "../models/api/response/work-rotation-response.model";
import type { CreateWorkRotation } from "../models/api/request/create-work-rotation.model";
import type { UpdateWorkRotation } from "../models/api/request/update-work-rotation.model";
import type { WorkRotationFilter } from "../models/api/request/work-rotation-filter.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "workscheduleplans");

export const workRotationApi = {
  getAll(filter: WorkRotationFilter = {}): Promise<WorkRotationResponse[]> {
    return httpClient.getUnwrapped<WorkRotationResponse[]>(ENDPOINT, {
      params: filter,
    });
  },

  getById(id: string): Promise<WorkRotationResponse> {
    return httpClient.getUnwrapped<WorkRotationResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateWorkRotation): Promise<WorkRotationResponse> {
    return httpClient.postUnwrapped<WorkRotationResponse>(
      `${ENDPOINT}/batch`,
      data,
    );
  },

  update(data: UpdateWorkRotation): Promise<WorkRotationResponse> {
    return httpClient.put<WorkRotationResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },

  removeByBatch(batchCode: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/batch`, {
      params: { batchCode },
    });
  },
};
