/** An admin's recorded confirmation of a setting that differs from the DOLE default. */
export interface ComplianceAcknowledgmentResponse {
  id: string;
  /** "company", or "client:{clientId}" for a client's own override. */
  scope: string;
  settingKey: string;
  settingLabel: string;
  statutoryValue: string;
  configuredValue: string;
  userEmail: string | null;
  ipAddress: string | null;
  acknowledgedAtUtc: string;
}

export interface ComplianceAcknowledgmentPage {
  items: ComplianceAcknowledgmentResponse[];
  total: number;
  page: number;
  pageSize: number;
}
