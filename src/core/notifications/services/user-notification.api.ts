import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UserNotificationPage } from "../models/user-notification.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "me/notifications");

export const userNotificationApi = {
  getMine(page = 1, pageSize = 20): Promise<UserNotificationPage> {
    return httpClient.getUnwrapped<UserNotificationPage>(ENDPOINT, {
      params: { page, pageSize },
    });
  },

  markAllRead(): Promise<number> {
    return httpClient.postUnwrapped<number>(`${ENDPOINT}/read-all`);
  },

  /** Removes all of the caller's saved notifications. */
  async clearAll(): Promise<void> {
    await httpClient.delete(ENDPOINT);
  },
};
