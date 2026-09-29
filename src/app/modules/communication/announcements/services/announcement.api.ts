import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PaginatedResponse } from "@/core/pagination-model";
import type {
  AnnouncementListQuery,
  AnnouncementUpsertRequest,
  AudiencePreviewRequest,
  RecipientListQuery,
  RemindTarget,
} from "../models/api/request/announcement-request.model";
import type {
  AnnouncementDetail,
  AnnouncementRecipient,
  AnnouncementStats,
  AnnouncementSummary,
  AudiencePreview,
} from "../models/api/response/announcement-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "announcements");

export const announcementApi = {
  list(
    query: AnnouncementListQuery,
  ): Promise<PaginatedResponse<AnnouncementSummary[]>> {
    return httpClient.getUnwrapped<PaginatedResponse<AnnouncementSummary[]>>(
      ENDPOINT,
      { params: query },
    );
  },

  getById(id: string): Promise<AnnouncementDetail> {
    return httpClient.getUnwrapped<AnnouncementDetail>(`${ENDPOINT}/${id}`);
  },

  stats(id: string): Promise<AnnouncementStats> {
    return httpClient.getUnwrapped<AnnouncementStats>(
      `${ENDPOINT}/${id}/stats`,
    );
  },

  recipients(
    id: string,
    query: RecipientListQuery,
  ): Promise<PaginatedResponse<AnnouncementRecipient[]>> {
    return httpClient.getUnwrapped<PaginatedResponse<AnnouncementRecipient[]>>(
      `${ENDPOINT}/${id}/recipients`,
      { params: query },
    );
  },

  previewAudience(request: AudiencePreviewRequest): Promise<AudiencePreview> {
    return httpClient.postUnwrapped<AudiencePreview>(
      `${ENDPOINT}/audience-preview`,
      request,
    );
  },

  createDraft(request: AnnouncementUpsertRequest): Promise<string> {
    return httpClient.postUnwrapped<string>(ENDPOINT, request);
  },

  update(id: string, request: AnnouncementUpsertRequest): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${id}`, request);
  },

  duplicate(id: string): Promise<string> {
    return httpClient.postUnwrapped<string>(`${ENDPOINT}/${id}/duplicate`);
  },

  publishNow(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/publish`);
  },

  schedule(id: string, publishAtUtc: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/schedule`, {
      publishAtUtc,
    });
  },

  unschedule(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/unschedule`);
  },

  unpublish(id: string, reason: string | null): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/unpublish`, { reason });
  },

  republish(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/republish`);
  },

  remind(id: string, target: RemindTarget): Promise<number> {
    return httpClient.postUnwrapped<number>(`${ENDPOINT}/${id}/remind`, {
      target,
    });
  },

  pin(id: string, pinnedUntilUtc: string | null): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/pin`, { pinnedUntilUtc });
  },

  unpin(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/unpin`);
  },

  archive(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/archive`);
  },

  restore(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/restore`);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },

  restoreDeleted(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/restore-deleted`);
  },
};
