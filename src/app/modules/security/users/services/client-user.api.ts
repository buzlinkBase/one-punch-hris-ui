import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ClientUserResponse } from "../models/api/response/user-response.model";

// Client-portal users are held by Tenant Service per client; the company's staff see them all at once
// and change one through its client.
const ENDPOINT = buildApiUrl(API_PREFIX.tenants, "clients");

const memberUrl = (clientEntityId: string, membershipId: string) =>
  `${ENDPOINT}/${clientEntityId}/members/${membershipId}`;

export const clientUserApi = {
  getAll(): Promise<ClientUserResponse[]> {
    return httpClient.getUnwrapped<ClientUserResponse[]>(
      `${ENDPOINT}/members`,
      { _skipErrorNotification: true },
    );
  },

  updateStatus(
    clientEntityId: string,
    membershipId: string,
    active: boolean,
  ): Promise<void> {
    return httpClient.patch<void>(
      `${memberUrl(clientEntityId, membershipId)}/status`,
      { status: active ? "Active" : "Inactive" },
      { _skipErrorNotification: true },
    );
  },

  remove(clientEntityId: string, membershipId: string): Promise<void> {
    return httpClient.delete<void>(memberUrl(clientEntityId, membershipId), {
      _skipErrorNotification: true,
    });
  },
};
