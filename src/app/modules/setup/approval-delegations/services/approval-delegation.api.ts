import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  ApprovalDelegationRequest,
  ApprovalDelegationResponse,
  DelegateCandidate,
} from "../models/approval-delegation.model";

const MINE = buildApiUrl(API_PREFIX.hrms, "me/approval-delegations");
const ADMIN = buildApiUrl(API_PREFIX.hrms, "approval-delegations");

export const approvalDelegationApi = {
  // ---- self-service (the caller's own, taken from their token) ----
  getMine(): Promise<ApprovalDelegationResponse[]> {
    return httpClient.getUnwrapped<ApprovalDelegationResponse[]>(MINE);
  },

  /** What others have delegated to the caller. */
  getToMe(): Promise<ApprovalDelegationResponse[]> {
    return httpClient.getUnwrapped<ApprovalDelegationResponse[]>(
      `${MINE}/to-me`,
    );
  },

  findCandidates(search?: string): Promise<DelegateCandidate[]> {
    return httpClient.getUnwrapped<DelegateCandidate[]>(`${MINE}/candidates`, {
      params: { search: search || undefined },
    });
  },

  createMine(data: ApprovalDelegationRequest) {
    return httpClient.postUnwrapped<ApprovalDelegationResponse>(MINE, data);
  },

  deactivateMine(id: string): Promise<void> {
    return httpClient.post<void>(`${MINE}/${id}/deactivate`);
  },

  // ---- admin (any person's) ----
  getAll(): Promise<ApprovalDelegationResponse[]> {
    return httpClient.getUnwrapped<ApprovalDelegationResponse[]>(ADMIN);
  },

  create(data: ApprovalDelegationRequest) {
    return httpClient.postUnwrapped<ApprovalDelegationResponse>(ADMIN, data);
  },

  deactivate(id: string): Promise<void> {
    return httpClient.post<void>(`${ADMIN}/${id}/deactivate`);
  },
};
