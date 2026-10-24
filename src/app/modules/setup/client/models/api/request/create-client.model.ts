export interface CreateClient {
  code: string;
  name: string;
  status: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  retirementDaysPerYear: number | null;
  uniformAllowance: number | null;
  uniformAllowanceBasis: "TenureMonths" | "PresentDays";
  /** Project sites tagged to the client; omit to leave them untouched, [] to untag all. */
  areaIds?: string[];
  /** Take sites that are tagged to another client. */
  reassignAreas?: boolean;
}
