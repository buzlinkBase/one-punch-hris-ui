import type { CreateRole } from "./create-role.model";

export interface UpdateRole extends CreateRole {
  id: string;
}
