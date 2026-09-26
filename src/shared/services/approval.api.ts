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

  // Owner/Admin-only escape hatch for a step whose configured/resolved approver can't
  // actually act -- reassigns the CURRENT step to a specific employee. See
  // ApprovalsController.Reassign / ApprovalEngineService.ReassignApproverAsync.
  reassignApprover(
    applicationType: ApprovalApplicationType,
    applicationId: string,
    payload: { newApproverEmployeeId: string; note?: string },
  ): Promise<void> {
    return httpClient.post<void>(
      `${ENDPOINT}/${applicationType}/${applicationId}/reassign`,
      payload,
    );
  },
};
