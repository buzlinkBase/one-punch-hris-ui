export interface DepartmentResponse {
  id: string;
  code: string;
  name: string;
  branchId: string;
  headId?: string | null;
  status: string;
}
