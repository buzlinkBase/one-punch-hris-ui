import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import type { NotificationPreferenceResponse } from "../models/api/response/notification-preference-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "notificationpreferences");

export const notificationPreferenceApi = {
  getMine(): Promise<NotificationPreferenceResponse[]> {
    return httpClient.getUnwrapped<NotificationPreferenceResponse[]>(
      `${ENDPOINT}/mine`,
    );
  },
  async updateMine(
    applicationType: ApprovalApplicationType,
    data: { emailEnabled: boolean; pushEnabled: boolean },
  ): Promise<void> {
    await httpClient.put(`${ENDPOINT}/mine/${applicationType}`, data);
  },
};
