import type { ApprovalApplicationType } from "@/shared/types/approval.model";

export interface ApprovalDelegationResponse {
  id: string;
  delegatorEmployeeId: string;
  delegatorName?: string | null;
  delegateEmployeeId: string;
  delegateName?: string | null;
  /** PH date, YYYY-MM-DD; null = from now. */
  fromDate?: string | null;
  /** PH date, YYYY-MM-DD, inclusive; null = until switched off. */
  toDate?: string | null;
  /** Null = every application type. */
  applicationType?: ApprovalApplicationType | null;
  onlyWhileOnLeave: boolean;
  isActive: boolean;
  reason?: string | null;
  /** Active and within its dates (a "while on leave" one also needs the leave itself to be today). */
  isInWindow: boolean;
}

export interface ApprovalDelegationRequest {
  /** Admin screen only; ignored on the self-service endpoint. */
  delegatorEmployeeId?: string;
  delegateEmployeeId: string;
  fromDate?: string | null;
  toDate?: string | null;
  applicationType?: ApprovalApplicationType | null;
  onlyWhileOnLeave: boolean;
  reason?: string | null;
}

export interface DelegateCandidate {
  id: string;
  name: string;
}
