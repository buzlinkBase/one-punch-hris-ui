export const PROFILE_UPDATE_REQUEST_LABEL = {
  MODULE: "Profile Update Request",
  TITLE: "Profile Update Requests",
  SUBTITLE:
    "Review and approve changes employees requested to their own personal information.",
};

export const APPROVAL_STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
  Withdrawn: "default",
};

export const APPROVAL_STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
  Withdrawn: "Withdrawn",
};

export const PROFILE_FIELD_LABEL = {
  newContact: "Contact No.",
  newAddress1: "Address Line 1",
  newAddress2: "Address Line 2",
  newCivilStatus: "Civil Status",
  newDOB: "Date of Birth",
  newBloodType: "Blood Type",
} as const;
