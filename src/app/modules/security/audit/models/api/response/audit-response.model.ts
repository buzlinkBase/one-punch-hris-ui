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

export interface AuditChange {
  property: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditResponse {
  id: string;
  action: AuditAction;
  /** Display label of the kind of record, e.g. "Official Business". */
  module: string;
  /** Raw record type, e.g. "OfficialBusiness" -- what the module filter sends back. */
  entityType: string | null;
  resourceId: string | null;
  userId: string | null;
  userName: string | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  /** UTC ISO timestamp. */
  timestamp: string;
  status: AuditStatus;
  /** The service that recorded it: hrms-api, auth-api or tenant-api. */
  source: string | null;
  changes: AuditChange[];
}

export interface AuditPage {
  items: AuditResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditModuleOption {
  value: string;
  label: string;
}

/** Server-side filters; every field optional. `from`/`to` are UTC ISO instants, `to` exclusive. */
export interface AuditLogParams {
  action?: AuditAction;
  status?: AuditStatus;
  module?: string;
  userId?: string;
  from?: string;
  to?: string;
  search?: string;
  page: number;
  pageSize: number;
}
