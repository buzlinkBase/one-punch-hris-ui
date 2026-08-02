import type { CreateOvertimeApplication } from "./create-overtime-application.model";

export interface UpdateOvertimeApplication extends CreateOvertimeApplication {
  id: string;
  otStatus: string;
}
