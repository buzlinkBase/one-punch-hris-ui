import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { RoleResponse } from "../models/api/response/role-response.model";
import type { CreateRole } from "../models/api/request/create-role.model";
import type { UpdateRole } from "../models/api/request/update-role.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "roles");

export const roleApi = {
  async getAll(): Promise<RoleResponse[]> {
    return httpClient.getUnwrapped<RoleResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<RoleResponse> {
    return httpClient.getUnwrapped<RoleResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateRole): Promise<RoleResponse> {
    return httpClient.postUnwrapped<RoleResponse>(ENDPOINT, data);
  },

  update(data: UpdateRole): Promise<RoleResponse> {
    return httpClient.put<RoleResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
