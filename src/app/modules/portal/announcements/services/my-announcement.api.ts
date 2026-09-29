import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PaginatedResponse } from "@/core/pagination-model";
import type {
  MyAnnouncementDetail,
  MyAnnouncementFilter,
  MyAnnouncementListItem,
} from "../models/api/response/my-announcement-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "me/announcements");

export const myAnnouncementApi = {
  getMine(params: {
    filter: MyAnnouncementFilter;
    page: number;
    limit: number;
  }): Promise<PaginatedResponse<MyAnnouncementListItem[]>> {
    return httpClient.getUnwrapped<PaginatedResponse<MyAnnouncementListItem[]>>(
      ENDPOINT,
      { params },
    );
  },

  getUnreadCount(): Promise<number> {
    return httpClient.getUnwrapped<number>(`${ENDPOINT}/unread-count`);
  },

  getPendingAcknowledgement(): Promise<MyAnnouncementListItem[]> {
    return httpClient.getUnwrapped<MyAnnouncementListItem[]>(
      `${ENDPOINT}/pending-acknowledgement`,
    );
  },

  /** Opening an announcement records the view server-side. */
  open(id: string): Promise<MyAnnouncementDetail> {
    return httpClient.getUnwrapped<MyAnnouncementDetail>(`${ENDPOINT}/${id}`);
  },

  acknowledge(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/acknowledge`);
  },
};
