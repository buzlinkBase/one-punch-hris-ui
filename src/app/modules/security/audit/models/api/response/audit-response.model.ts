export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "EXPORT"
  | "APPROVE"
  | "REJECT";

export type AuditStatus = "SUCCESS" | "FAILED";

export interface AuditResponse {
  id: string;
  action: AuditAction;
  module: string;
  resourceId: string;
  userId: string;
  userName: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: AuditStatus;
}
