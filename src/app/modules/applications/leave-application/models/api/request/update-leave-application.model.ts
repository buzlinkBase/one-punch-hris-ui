import type { CreateLeaveApplication } from "./create-leave-application.model";

export interface UpdateLeaveApplication extends CreateLeaveApplication {
  id: string;
  approvalStatus: string;
  /** Approver's note for an approve/decline transition — see ApprovalActionModal. */
  note?: string;
}
