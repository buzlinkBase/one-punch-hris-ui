import type { InviteEntityType } from "../request/batch-invitation-request.model";

/** The employee or client record a member belongs to (hrms-api). */
export interface UserLinkResponse {
  /** Null when found by email only -- an invite not yet accepted. */
  userId: string | null;
  email: string;
  type: InviteEntityType;
  employeeId: string | null;
  employeeNo: string | null;
  departmentName: string | null;
  clientId: string | null;
  clientCode: string | null;
  clientName: string | null;
  name: string | null;
}
