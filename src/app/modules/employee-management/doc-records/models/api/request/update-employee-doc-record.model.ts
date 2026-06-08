import type { CreateEmployeeDocRecord } from "./create-employee-doc-record.model";

export interface UpdateEmployeeDocRecord extends CreateEmployeeDocRecord {
  id: string;
}
