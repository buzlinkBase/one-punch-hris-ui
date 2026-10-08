// Mirrors backend SaveDtrDraftRequest (POST dailyrecords/save-draft): what the DTR was generated
// from plus the ticked employees. The server recomputes and saves the rows itself, so a big
// company's save is a few KB instead of every calculated row.
export interface SaveDtrDraftRequest {
  fromDate: string;
  toDate: string;
  payrollGroupId: string;
  branchId?: string;
  departmentId?: string;
  clientId?: string;
  operationAreaId?: string;
  employeeIds: string[];
  postingDescription?: string;
}
