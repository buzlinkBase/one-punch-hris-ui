export interface CreateDepartment {
  code: string;
  name: string;
  parentDepartmentId?: string | null;
  headId?: string | null;
  status: string;
}
