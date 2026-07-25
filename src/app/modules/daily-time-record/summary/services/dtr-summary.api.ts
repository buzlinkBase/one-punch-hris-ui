import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrSummaryResponse } from "../models/api/response/dtr-summary-response.model";
import type { DtrDetailResponse } from "../../detail/models/api/response/dtr-detail-response.model";
import type { BatchesModel } from "../models/api/response/batches.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/load-summary");
const CODES_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/codes");
const BATCH_LIST_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/batch-codes",
);

export const dtrSummaryApi = {
  getBatchCodes(): Promise<BatchesModel[]> {
    return httpClient.getUnwrapped<BatchesModel[]>(BATCH_LIST_ENDPOINT);
  },

  getByBatchCode(batchCode: string): Promise<DtrDetailResponse[]> {
    return httpClient.getUnwrapped<DtrDetailResponse[]>(CODES_ENDPOINT, {
      params: { batchCode },
    });
  },

  getByBatchSummary(batchCode: string): Promise<DtrSummaryResponse[]> {
    return httpClient.postUnwrapped<DtrSummaryResponse[]>(
      `${ENDPOINT}?batchCode=${encodeURIComponent(batchCode)}`,
      {},
    );
  },
};
