import type { CreateDepartment } from "./create-department.model";

export interface UpdateDepartment extends CreateDepartment {
  id: string;
}
