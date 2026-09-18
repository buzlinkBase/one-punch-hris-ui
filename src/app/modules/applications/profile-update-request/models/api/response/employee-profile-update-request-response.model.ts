export interface EmployeeProfileUpdateRequestResponse {
  id: string;
  employeeId: string;
  employeeName?: string | null;
  approvalStatus: string;
  createdAt: string;
  remarks?: string | null;

  newContact?: string | null;
  newAddress1?: string | null;
  newAddress2?: string | null;
  newCivilStatus?: string | null;
  newDOB?: string | null;
  newBloodType?: string | null;

  currentContact?: string | null;
  currentAddress1?: string | null;
  currentAddress2?: string | null;
  currentCivilStatus?: string | null;
  currentDOB?: string | null;
  currentBloodType?: string | null;

  /** True when the Employee record was edited elsewhere after this request was submitted. */
  hasConflict: boolean;
}
