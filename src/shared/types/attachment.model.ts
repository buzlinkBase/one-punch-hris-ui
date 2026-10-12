/** What a file can be attached to. Mirrors hrms-api AttachmentOwnerType (sent and received by name). */
export type AttachmentOwnerType =
  | "EmployeeRecord"
  | "AssignAsset"
  | "LeaveApplication"
  | "ProfileUpdateRequest"
  | "TravelOrder"
  | "PassSlip"
  | "UnderTime"
  | "OverTime"
  | "Loan"
  | "CashBond"
  | "OtherIncome";

export interface AttachmentResponse {
  id: string;
  ownerType: AttachmentOwnerType;
  /** Null while the file is staged: uploaded by a form whose record isn't saved yet. */
  ownerId: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface AttachmentSettingResponse {
  ownerType: AttachmentOwnerType;
  enabled: boolean;
}

export interface AttachmentLinkResponse {
  /** A short-lived link to the file, or null when it has to be downloaded through the API. */
  url: string | null;
}
