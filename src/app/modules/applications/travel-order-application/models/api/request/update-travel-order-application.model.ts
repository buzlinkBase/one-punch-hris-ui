import type { CreateTravelOrderApplication } from "./create-travel-order-application.model";

export interface UpdateTravelOrderApplication extends CreateTravelOrderApplication {
  id: string;
  approvalStatus: string;
  /** Approver's note for an approve/decline transition — see ApprovalActionModal. */
  note?: string;
}
