import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import type { MyApproval } from "../models/my-approval.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "me/approvals");

export const myApprovalsApi = {
  getPending(): Promise<MyApproval[]> {
    return httpClient.getUnwrapped<MyApproval[]>(`${ENDPOINT}/pending`);
  },

  getInProgress(): Promise<MyApproval[]> {
    return httpClient.getUnwrapped<MyApproval[]>(`${ENDPOINT}/in-progress`);
  },

  act(
    applicationType: ApprovalApplicationType,
    applicationId: string,
    action: "approve" | "decline",
    note?: string,
  ): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/${applicationType}/${applicationId}/${action}`,
      { note },
    );
  },
};
