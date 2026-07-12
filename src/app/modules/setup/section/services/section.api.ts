import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { SectionResponse } from "../models/api/response/section-response.model";
import type { CreateSection } from "../models/api/request/create-section.model";
import type { UpdateSection } from "../models/api/request/update-section.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "sections");

export const sectionApi = {
  getAll(): Promise<SectionResponse[]> {
    return httpClient.getUnwrapped<SectionResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<SectionResponse> {
    return httpClient.getUnwrapped<SectionResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreateSection): Promise<SectionResponse> {
    return httpClient.postUnwrapped<SectionResponse>(ENDPOINT, data);
  },
  update(data: UpdateSection): Promise<SectionResponse> {
    return httpClient.put<SectionResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
