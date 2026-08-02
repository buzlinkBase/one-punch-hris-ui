import type { CreateUndertimeApplication } from "./create-undertime-application.model";

export interface UpdateUndertimeApplication extends CreateUndertimeApplication {
  id: string;
  approvalStatus: string;
}
