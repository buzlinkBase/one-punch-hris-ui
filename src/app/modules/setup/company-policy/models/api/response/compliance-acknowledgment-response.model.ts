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

/** A setting in effect that differs from the DOLE default but that no admin has confirmed yet. */
export interface OutstandingDeviationResponse {
  /** "company", or "client:{clientId}" for a client's own override. */
  scope: string;
  settingKey: string;
  settingLabel: string;
  statutoryValue: string;
  configuredValue: string;
  note: string;
  /** Where it is set (up to 10), e.g. "Shift: Night" or "Client: Acme". */
  sources: string[];
  sourceCount: number;
}

/** Whether confirmations are being asked for and recorded (only while the Terms are live). */
export type TermsLivenessState = "Live" | "NotLive" | "Unreachable";

export interface OutstandingDeviationsResponse {
  termsState: TermsLivenessState;
  items: OutstandingDeviationResponse[];
}
