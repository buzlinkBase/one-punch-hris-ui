import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import type { ApprovalWorkflowRequest } from "../models/api/request/approval-workflow-request.model";
import type { ApprovalWorkflowResponse } from "../models/api/response/approval-workflow-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "approvalworkflows");

export const approvalWorkflowApi = {
  getAll(
    applicationType: ApprovalApplicationType,
  ): Promise<ApprovalWorkflowResponse[]> {
    return httpClient.getUnwrapped<ApprovalWorkflowResponse[]>(
      `${ENDPOINT}?applicationType=${applicationType}`,
    );
  },

  getById(id: string): Promise<ApprovalWorkflowResponse> {
    return httpClient.getUnwrapped<ApprovalWorkflowResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(data: ApprovalWorkflowRequest): Promise<ApprovalWorkflowResponse> {
    return httpClient.postUnwrapped<ApprovalWorkflowResponse>(ENDPOINT, data);
  },

  update(
    id: string,
    data: ApprovalWorkflowRequest,
  ): Promise<ApprovalWorkflowResponse> {
    return httpClient.putUnwrapped<ApprovalWorkflowResponse>(
      `${ENDPOINT}/${id}`,
      data,
    );
  },

  activate(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/activate`);
  },

  deactivate(id: string): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/${id}/deactivate`);
  },

  /**
   * Activate when the current one drains: takes over once the active workflow for its
   * type/scope has no pending requests. Resolves to whether it took over right away.
   */
  async scheduleActivation(id: string): Promise<boolean> {
    const result = await httpClient.postUnwrapped<{ activated: boolean }>(
      `${ENDPOINT}/${id}/schedule-activation`,
    );
    return result.activated;
  },

  cancelScheduledActivation(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}/schedule-activation`);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
