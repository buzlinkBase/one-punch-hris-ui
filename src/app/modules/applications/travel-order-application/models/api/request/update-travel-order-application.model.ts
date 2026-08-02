import type { CreateTravelOrderApplication } from "./create-travel-order-application.model";

export interface UpdateTravelOrderApplication extends CreateTravelOrderApplication {
  id: string;
  approvalStatus: string;
}
