export interface ClientPolicyResponse {
  otEligibility: string | null;
  otInclusionPolicy: string | null;
  // Null (or 0) means no cap on that statutory type's monthly EE (employee) deduction.
  maxSSSCapping: number | null;
  maxPhilHealthCapping: number | null;
  maxPagIbigCapping: number | null;
}
