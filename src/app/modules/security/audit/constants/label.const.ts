export const AUDIT_LABEL = {
  TITLE: "Audit Logs",
  ACTION: "Action",
  MODULE: "Module",
  RESOURCE_ID: "Resource ID",
  USER: "Performed By",
  DESCRIPTION: "Description",
  IP_ADDRESS: "IP Address",
  USER_AGENT: "User Agent",
  TIMESTAMP: "Timestamp",
  STATUS: "Status",
  SOURCE: "Recorded By",
  CHANGES: "Changes",
  FIELD: "Field",
  BEFORE: "Before",
  AFTER: "After",
  NO_CHANGES: "No field changes recorded for this action.",
  DETAIL_TITLE: "Audit Log Detail",
  VIEW_ACTIVITY: "View Activity",
  REFRESH: "Refresh",
  AUTO_REFRESH: "Auto-refresh",
  AUTO_REFRESH_HINT: "Check for new entries every 30 seconds",
};

/** Which part of the system recorded the event. */
export const AUDIT_SOURCE_LABELS: Record<string, string> = {
  "hrms-api": "HRIS",
  "auth-api": "Sign-in",
  "tenant-api": "Company & Access",
  "adms-api": "Biometric Devices",
};

export const AUDIT_ACTION_COLORS: Record<string, string> = {
  LOGIN: "blue",
  LOGOUT: "default",
  CREATE: "green",
  UPDATE: "orange",
  DELETE: "red",
  VIEW: "cyan",
  EXPORT: "purple",
  APPROVE: "success",
  REJECT: "error",
};

export const AUDIT_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "success",
  FAILED: "error",
};
