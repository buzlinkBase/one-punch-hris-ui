import type { CreateEmployeeDependent } from "./create-employee-dependent.model";

export interface UpdateEmployeeDependent extends CreateEmployeeDependent {
  id: string;
}
