import type { CreatePassSlip } from "./create-pass-slip.model";

export interface UpdatePassSlip extends CreatePassSlip {
  id: string;
  approvalStatus: string;
}
