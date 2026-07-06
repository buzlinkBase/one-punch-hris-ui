import type { CreateEmployee } from "./create-employee.model";

export interface UpdateEmployee extends CreateEmployee {
  id: string;
}
