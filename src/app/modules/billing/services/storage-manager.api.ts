import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { StorageDeleteRequest } from "../models/api/request/storage-manager-request.model";
import type {
  StorageBreakdownResponse,
  StorageDeletePreviewResponse,
  StorageDeleteResultResponse,
  StoredFilePageResponse,
} from "../models/api/response/storage-manager-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "storage-manager");

/** Billing > Storage: what fills the current company's file storage, and freeing it -- Storage:View / Storage:Manage. */
export const storageManagerApi = {
  getBreakdown(): Promise<StorageBreakdownResponse> {
    return httpClient.getUnwrapped<StorageBreakdownResponse>(
      `${ENDPOINT}/breakdown`,
    );
  },

  getFiles(
    category: string,
    year: number,
    page: number,
    pageSize: number,
  ): Promise<StoredFilePageResponse> {
    return httpClient.getUnwrapped<StoredFilePageResponse>(
      `${ENDPOINT}/files`,
      { params: { category, year, page, pageSize } },
    );
  },

  previewDelete(
    payload: StorageDeleteRequest,
  ): Promise<StorageDeletePreviewResponse> {
    return httpClient.postUnwrapped<StorageDeletePreviewResponse>(
      `${ENDPOINT}/delete/preview`,
      payload,
    );
  },

  deleteFiles(
    payload: StorageDeleteRequest,
  ): Promise<StorageDeleteResultResponse> {
    return httpClient.postUnwrapped<StorageDeleteResultResponse>(
      `${ENDPOINT}/delete`,
      payload,
    );
  },
};
