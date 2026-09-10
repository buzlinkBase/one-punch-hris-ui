import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { Role } from "../models/api/response/role-response.model";
import type { CreateRole } from "../models/api/request/create-role.model";
import type { UpdateRole } from "../models/api/request/update-role.model";

const ENDPOINT = buildApiUrl(API_PREFIX.tenants, "roles");

export const roleApi = {
  async getAll(): Promise<Role[]> {
    return httpClient.getUnwrapped<Role[]>(ENDPOINT);
  },

  async getById(id: string): Promise<Role> {
    return httpClient.getUnwrapped<Role>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateRole): Promise<Role> {
    return httpClient.postUnwrapped<Role>(ENDPOINT, data);
  },

  update(id: string, data: UpdateRole): Promise<Role> {
    return httpClient.putUnwrapped<Role>(`${ENDPOINT}/${id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },

  setPermissions(id: string, permissionIds: string[]): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${id}/permissions`, {
      permissionIds,
    });
  },
};
