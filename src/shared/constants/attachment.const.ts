import type { AttachmentOwnerType } from "../types/attachment.model";

/** What each attachment-capable feature is called, and what its files are for. */
export const ATTACHMENT_FEATURE: Record<
  AttachmentOwnerType,
  { label: string; description: string }
> = {
  EmployeeRecord: {
    label: "Employee Documents",
    description: "Scanned documents on an employee's 201 file.",
  },
  AssignAsset: {
    label: "Employee Assets",
    description: "Photos of assets issued to an employee.",
  },
  LeaveApplication: {
    label: "Leave Applications",
    description: "Supporting documents such as a medical certificate.",
  },
  ProfileUpdateRequest: {
    label: "Profile Update Requests",
    description: "Proof for a requested change to an employee's profile.",
  },
  TravelOrder: {
    label: "Travel Orders",
    description: "Itinerary or invitation for a travel order.",
  },
  PassSlip: {
    label: "Pass Slips",
    description: "Supporting files for a pass slip.",
  },
  UnderTime: {
    label: "Undertime",
    description: "Supporting files for an undertime application.",
  },
  OverTime: {
    label: "Overtime",
    description: "Supporting files for an overtime application.",
  },
  Loan: {
    label: "Loans",
    description: "Supporting documents for a loan application.",
  },
  CashBond: {
    label: "Cash Bonds",
    description: "Supporting documents for a cash bond.",
  },
  OtherIncome: {
    label: "Other Income",
    description: "Supporting documents for other income.",
  },
};
