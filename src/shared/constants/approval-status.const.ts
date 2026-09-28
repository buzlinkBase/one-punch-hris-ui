// Status every filed application starts in. The server forces it regardless of what's sent --
// only the approval engine's approve/decline actions ever move an application out of it.
export const DEFAULT_FILING_STATUS = "ForApproval";

export const APPROVAL_STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
  Withdrawn: "Withdrawn",
};
