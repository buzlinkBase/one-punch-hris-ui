import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { BranchResponse } from "../models/api/response/branch-response.model";
import type { CreateBranch } from "../models/api/request/create-branch.model";
import type { UpdateBranch } from "../models/api/request/update-branch.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "branches");

const MOCK_BRANCHES: BranchResponse[] = Array.from({ length: 12 }, (_, i) => ({
  id: `branch-${i + 1}`,
  code: `BR${String(i + 1).padStart(3, "0")}`,
  name: `Branch ${i + 1}`,
  status: i % 5 === 0 ? "INACTIVE" : "ACTIVE",
}));

export const branchApi = {
  async getAll(): Promise<BranchResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<BranchResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_BRANCHES;
    } catch {
      return MOCK_BRANCHES;
    }
  },
  async getById(id: string): Promise<BranchResponse> {
    try {
      return await httpClient.getUnwrapped<BranchResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = MOCK_BRANCHES.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Branch ${id} not found`);
    }
  },
  create(data: CreateBranch): Promise<BranchResponse> {
    return httpClient.postUnwrapped<BranchResponse>(ENDPOINT, data);
  },
  update(data: UpdateBranch): Promise<BranchResponse> {
    return httpClient.put<BranchResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
