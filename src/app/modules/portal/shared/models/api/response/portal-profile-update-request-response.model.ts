export interface PortalProfileUpdateRequestResponse {
  id: string;
  employeeId: string;
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

  hasConflict: boolean;
}
