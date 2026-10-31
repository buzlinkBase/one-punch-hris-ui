import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  ComplianceAcknowledgmentPage,
  OutstandingDeviationsResponse,
} from "../models/api/response/compliance-acknowledgment-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "ComplianceAcknowledgments");

export const complianceAcknowledgmentApi = {
  list(page: number, pageSize: number): Promise<ComplianceAcknowledgmentPage> {
    return httpClient.getUnwrapped<ComplianceAcknowledgmentPage>(ENDPOINT, {
      params: { page, pageSize },
    });
  },

  outstanding(): Promise<OutstandingDeviationsResponse> {
    return httpClient.getUnwrapped<OutstandingDeviationsResponse>(
      `${ENDPOINT}/outstanding`,
    );
  },

  /** Records a confirmation by the current admin for everything still unconfirmed. */
  confirmOutstanding(): Promise<number> {
    return httpClient.postUnwrapped<number>(`${ENDPOINT}/outstanding/confirm`);
  },
};
