import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PermissionResponse } from "../models/api/response/permission-response.model";
import type { CreatePermission } from "../models/api/request/create-permission.model";
import type { UpdatePermission } from "../models/api/request/update-permission.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "permissions");

export const permissionApi = {
  async getAll(): Promise<PermissionResponse[]> {
    return httpClient.getUnwrapped<PermissionResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<PermissionResponse> {
    return httpClient.getUnwrapped<PermissionResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreatePermission): Promise<PermissionResponse> {
    return httpClient.postUnwrapped<PermissionResponse>(ENDPOINT, data);
  },

  update(data: UpdatePermission): Promise<PermissionResponse> {
    return httpClient.put<PermissionResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
