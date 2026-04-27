import httpClient from "@/core/http/http-client";
import type { RoleResponse } from "../models/api/response/role-response.model";
import type { CreateRole } from "../models/api/request/create-role.model";
import type { UpdateRole } from "../models/api/request/update-role.model";

const ENDPOINT = "roles";

const MOCK_ROLES: RoleResponse[] = [
  { id: "role-1", roleName: "Administrator", status: "ACTIVE" },
  { id: "role-2", roleName: "Manager", status: "ACTIVE" },
  { id: "role-3", roleName: "Supervisor", status: "ACTIVE" },
  { id: "role-4", roleName: "Payroll Encoder", status: "ACTIVE" },
  { id: "role-5", roleName: "Timekeeper", status: "INACTIVE" },
];

export const roleApi = {
  async getAll(): Promise<RoleResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<RoleResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_ROLES;
    } catch {
      return MOCK_ROLES;
    }
  },

  async getById(id: string): Promise<RoleResponse> {
    try {
      return await httpClient.getUnwrapped<RoleResponse>(`${ENDPOINT}/${id}`);
    } catch {
      const match = MOCK_ROLES.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Role ${id} not found`);
    }
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
