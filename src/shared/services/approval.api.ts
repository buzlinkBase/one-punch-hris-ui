import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  ApprovalApplicationType,
  ApprovalInstanceResponse,
} from "../types/approval.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "approvals");

export const approvalApi = {
  getInstance(
    applicationType: ApprovalApplicationType,
    applicationId: string,
  ): Promise<ApprovalInstanceResponse> {
    return httpClient.getUnwrapped<ApprovalInstanceResponse>(
      `${ENDPOINT}/${applicationType}/${applicationId}`,
    );
  },

  getEligibility(
    applicationType: ApprovalApplicationType,
    applicationId: string,
  ): Promise<boolean> {
    return httpClient.getUnwrapped<boolean>(
      `${ENDPOINT}/${applicationType}/${applicationId}/eligibility`,
    );
  },
};
