import type { CreateLeaveApplication } from "./create-leave-application.model";

export interface UpdateLeaveApplication extends CreateLeaveApplication {
  id: string;
  approvalStatus: string;
}
