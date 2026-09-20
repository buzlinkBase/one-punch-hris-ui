import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UserResponse } from "../models/api/response/user-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.tenants, "members");

export interface ReplaceRolesPayload {
  roles: string[];
}

export interface UpdateStatusPayload {
  status: string;
}

export const userApi = {
  async getAll(): Promise<UserResponse[]> {
    return httpClient.getUnwrapped<UserResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<UserResponse> {
    const all = await this.getAll();
    const match = all.find((item) => item.id === id);
    if (!match) throw new Error(`User ${id} not found`);
    return match;
  },

  replaceRoles(membershipId: string, roles: string[]): Promise<void> {
    const payload: ReplaceRolesPayload = { roles };
    return httpClient.put<void>(`${ENDPOINT}/${membershipId}/roles`, payload, {
      _skipErrorNotification: true,
    });
  },

  updateStatus(membershipId: string, status: string): Promise<void> {
    const payload: UpdateStatusPayload = { status };
    return httpClient.patch<void>(
      `${ENDPOINT}/${membershipId}/status`,
      payload,
      {
        _skipErrorNotification: true,
      },
    );
  },

  removeMembership(membershipId: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${membershipId}`, {
      _skipErrorNotification: true,
    });
  },
};
