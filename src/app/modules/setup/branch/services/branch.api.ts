import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { BranchResponse } from "../models/api/response/branch-response.model";
import type { CreateBranch } from "../models/api/request/create-branch.model";
import type { UpdateBranch } from "../models/api/request/update-branch.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "branches");

export const branchApi = {
  getAll(): Promise<BranchResponse[]> {
    return httpClient.getUnwrapped<BranchResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<BranchResponse> {
    return httpClient.getUnwrapped<BranchResponse>(`${ENDPOINT}/${id}`);
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
