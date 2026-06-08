import type { CreateDeduction } from "./create-deduction.model";

export interface UpdateDeduction extends CreateDeduction {
  id: string;
}
