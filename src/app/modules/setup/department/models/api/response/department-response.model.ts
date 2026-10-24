export interface DepartmentResponse {
  id: string;
  code: string;
  name: string;
  branchId: string;
  parentDepartmentId?: string | null;
  headId?: string | null;
  status: string;
}
