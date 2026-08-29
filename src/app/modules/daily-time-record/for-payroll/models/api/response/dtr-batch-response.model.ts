export interface DtrBatchModel {
  code: string;
  fromDate: string;
  toDate: string;
  employeeCount: number;
  isPosted: boolean;
  postingDescription?: string | null;
  isPayrollGenerated: boolean;
}
