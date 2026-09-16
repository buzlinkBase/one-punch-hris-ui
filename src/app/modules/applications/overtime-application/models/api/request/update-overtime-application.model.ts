import type { CreateOvertimeApplication } from "./create-overtime-application.model";

export interface UpdateOvertimeApplication extends CreateOvertimeApplication {
  id: string;
  approvalStatus: string;
  /** Approver's note for an approve/decline transition — see ApprovalActionModal. */
  note?: string;
}
