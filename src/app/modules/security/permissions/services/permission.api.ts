import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PermissionResponse } from "../models/api/response/permission-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "permissions");

// Read-only — the feature/action catalog is system-seeded, never admin-created, so there is
// deliberately no create/update/delete here.
export const permissionApi = {
  async getAll(): Promise<PermissionResponse[]> {
    return httpClient.getUnwrapped<PermissionResponse[]>(ENDPOINT);
  },
};
