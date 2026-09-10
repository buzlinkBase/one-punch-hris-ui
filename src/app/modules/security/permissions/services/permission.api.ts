import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PermissionResponse } from "../models/api/response/permission-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.tenants, "permissions");

export const permissionApi = {
  async getAll(): Promise<PermissionResponse[]> {
    return httpClient.getUnwrapped<PermissionResponse[]>(ENDPOINT);
  },
};
