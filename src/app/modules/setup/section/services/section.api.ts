import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { SectionResponse } from "../models/api/response/section-response.model";
import type { CreateSection } from "../models/api/request/create-section.model";
import type { UpdateSection } from "../models/api/request/update-section.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "sections");

const MOCK_SECTIONS: SectionResponse[] = Array.from({ length: 12 }, (_, i) => ({
  id: `section-${i + 1}`,
  departmentId: `dept-${(i % 6) + 1}`,
  departmentName: `Department ${(i % 6) + 1}`,
  code: `SEC${String(i + 1).padStart(3, "0")}`,
  name: `Section ${i + 1}`,
  status: i % 5 === 0 ? "INACTIVE" : "ACTIVE",
}));

export const sectionApi = {
  async getAll(): Promise<SectionResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<SectionResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_SECTIONS;
    } catch {
      return MOCK_SECTIONS;
    }
  },
  async getById(id: string): Promise<SectionResponse> {
    try {
      return await httpClient.getUnwrapped<SectionResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_SECTIONS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Section ${id} not found`);
    }
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
