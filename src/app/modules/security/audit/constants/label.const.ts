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
  DETAIL_TITLE: "Audit Log Detail",
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
