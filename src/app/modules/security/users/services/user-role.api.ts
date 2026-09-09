import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { RoleResponse } from "@/app/modules/security/roles/models/api/response/role-response.model";

// Distinct from ./user.api.ts (which targets API_PREFIX.tenants + "members" — the tenant
// membership tier: Owner/Admin/Member). This targets hrms-api's own product-feature Roles.
const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "user-roles");

export const userRoleApi = {
  getRoles(userId: string): Promise<RoleResponse[]> {
    return httpClient.getUnwrapped<RoleResponse[]>(`${ENDPOINT}/${userId}`);
  },

  replaceRoles(userId: string, roleIds: string[]): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${userId}`, { roleIds });
  },
};
