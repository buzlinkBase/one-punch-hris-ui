export type PortalModuleKey =
  | "TimeLogs"
  | "Invoicing"
  | "Payments"
  | "Disputes"
  | "Reports"
  | "IncidentReports"
  | "Training"
  | "Quotations"
  | "DocumentVault"
  | "Manpower"
  | "Ratings"
  | "NoticeBoard";

export interface PortalClient {
  id: string;
  code: string;
  name: string;
  externalId: string | null;
  isActive: boolean;
}

export interface PortalSite {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface PortalClientUser {
  id: string;
  email: string;
  fullName: string;
  /** Can use the client right now: false for someone revoked on their own, and for everyone while the client is off. */
  isActive: boolean;
  isClientAdmin: boolean;
  invitePending: boolean;
  /** Switched off on their own, so they stay off when the client comes back; false when only the client is off. */
  revokedIndividually: boolean;
  lastLoginAt: string | null;
}

export type PortalModuleSwitches = Record<string, boolean>;

export interface IntegrationSource {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
}

/** Returned once, when a key is created or rotated. */
export interface IntegrationSourceKey {
  source: IntegrationSource;
  apiKey: string;
}

export type PeriodStatus = "Verified" | "SignedOff";

export interface DtrPeriod {
  id: string;
  clientId: string;
  siteId: string | null;
  from: string;
  to: string;
  status: PeriodStatus;
  verifiedBy: string;
  verifiedAt: string;
  signedOffBy: string | null;
  signedOffAt: string | null;
}

export interface BlockingRecord {
  recordId: string;
  workDate: string;
  guardName: string;
  type: string;
}

export interface PortalRowError {
  externalId: string;
  error: string;
}

export interface PortalSyncSummary {
  batchCode: string;
  atUtc: string;
  records: number;
  accepted: number;
  rejected: number;
  succeeded: boolean;
  message: string | null;
  errors: PortalRowError[] | null;
  /** "Upsert" (rows sent) or "Remove" (rows deleted/unposted in HRIS); null on summaries saved before removals existed. */
  operation: "Upsert" | "Remove" | null;
  /** Handed to the message bus; the portal hasn't answered every part yet. */
  waiting: boolean;
  partsReceived: number;
  parts: number;
}

/** This company's connection to the portal (served by hrms-api; the API key is never returned). */
export interface PortalConnection {
  enabled: boolean;
  portalUrl: string;
  hasApiKey: boolean;
  lastSync: PortalSyncSummary | null;
}

export type InvoiceStatus =
  "Draft" | "ForReview" | "Approved" | "Issued" | "Voided";

export type InvoiceSource = "Generated" | "Uploaded" | "External";
export type DeliveryMode = "Email" | "RecordOnly";
export type PaymentMethod = "BankTransfer" | "Check" | "Cash" | "Online";
export type PaymentRecordStatus = "Pending" | "Confirmed" | "Rejected";
export type CheckStatus = "None" | "PostDated" | "Cleared" | "Bounced";

export interface BillingProfile {
  clientId: string;
  legalName: string;
  address: string;
  tin: string;
  billingEmails: string;
  paymentTermsDays: number;
  cycle: "Monthly" | "SemiMonthly";
  defaultSource: InvoiceSource;
  defaultDelivery: DeliveryMode;
  showInPortalByDefault: boolean;
  approvedOnlySending: boolean;
  attachDtrSummary: boolean;
  requireClientSignOff: boolean;
  vatRate: number;
  withholdingRate: number;
  overtimeMultiplier: number;
  nightDiffPremium: number;
  holidayPremium: number;
  paymentInstructions: string | null;
}

export type RateUnit = "PerHour" | "PerDay" | "PerMonth";

export interface ContractRate {
  id: string;
  siteId: string | null;
  siteName: string | null;
  shiftName: string | null;
  unit: RateUnit;
  amount: number;
  hoursPerDay: number;
  daysPerMonth: number;
  effectiveFrom: string;
  hourlyEquivalent: number;
}

export interface InvoiceSummary {
  id: string;
  clientId: string;
  clientName: string;
  number: string | null;
  source: InvoiceSource;
  status: InvoiceStatus;
  paymentStatus: "Unpaid" | "PartiallyPaid" | "Paid";
  displayStatus: string;
  delivery: DeliveryMode;
  showInPortal: boolean;
  periodFrom: string;
  periodTo: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  memoTotal: number;
  amountPaid: number;
  balance: number;
  daysOverdue: number;
  hasFile: boolean;
}

export interface InvoiceLine {
  id: string;
  kind: string;
  description: string;
  shiftName: string | null;
  quantity: number;
  unitRate: number;
  amount: number;
  reason: string | null;
}

export interface InvoiceDelivery {
  id: string;
  toEmails: string;
  succeeded: boolean;
  error: string | null;
  at: string;
  sentBy: string;
}

export interface PaymentSummary {
  id: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentRecordStatus;
  submittedByClient: boolean;
  checkStatus: CheckStatus;
  receiptNumber: string | null;
  rejectReason: string | null;
  hasProof: boolean;
  allocated: number;
  unallocated: number;
  claimedInvoiceId: string | null;
}

export interface Memo {
  id: string;
  invoiceId: string;
  kind: "Credit" | "Debit";
  number: string;
  memoDate: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  reason: string;
  createdBy: string;
}

export interface CollectionNote {
  id: string;
  invoiceId: string;
  kind: "Call" | "Email" | "Visit" | "Other";
  contact: string;
  note: string;
  promisedDate: string | null;
  at: string;
  by: string;
}

export interface OverdueRow {
  invoiceId: string;
  number: string;
  clientId: string;
  clientName: string;
  dueDate: string;
  daysOverdue: number;
  balance: number;
  disputed: number;
  lastContactAt: string | null;
  promisedDate: string | null;
}

export interface AgingRow {
  clientId: string;
  clientName: string;
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  over90: number;
  total: number;
}

export interface AgingReport {
  asOf: string;
  rows: AgingRow[];
  totals: AgingRow;
}

export interface BillingDashboard {
  from: string;
  to: string;
  billed: number;
  collected: number;
  outstanding: number;
  overdue: number;
  draftInvoices: number;
  invoicesAwaitingApproval: number;
  pendingProofs: number;
  openDisputes: number;
  overdueInvoices: number;
}

export interface CollectionRow {
  paymentId: string;
  paymentDate: string;
  clientId: string;
  clientName: string;
  method: PaymentMethod;
  reference: string;
  amount: number;
}

export interface CollectionsReport {
  from: string;
  to: string;
  rows: CollectionRow[];
  byMethod: { method: PaymentMethod; total: number; count: number }[];
  total: number;
}

export interface BillingSummaryRow {
  clientId: string;
  clientName: string;
  month: string;
  billed: number;
  collected: number;
}

export interface Missing2307Row {
  invoiceId: string;
  number: string;
  clientId: string;
  clientName: string;
  invoiceDate: string;
  expected: number;
  received: number;
}

export interface Cert2307 {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amountWithheld: number;
  receivedDate: string;
  reference: string | null;
  fileName: string;
  uploadedBy: string;
}

export type DisputeStatus = "Open" | "UnderReview" | "Resolved" | "Declined";

export interface DisputeSummary {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  status: DisputeStatus;
  disputedAmount: number;
  reason: string;
  raisedBy: string;
  createdAt: string;
  resolvedAt: string | null;
  outcome: string | null;
}

export interface DisputeComment {
  id: string;
  author: string;
  fromAgency: boolean;
  body: string;
  at: string;
}

export interface DisputeDetail {
  summary: DisputeSummary;
  lineDescription: string | null;
  resolvedBy: string | null;
  memoId: string | null;
  comments: DisputeComment[];
}

export interface StatementLine {
  date: string;
  type: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface Statement {
  clientId: string;
  clientName: string;
  from: string;
  to: string;
  openingBalance: number;
  lines: StatementLine[];
  closingBalance: number;
}

export interface HistoryEntry {
  at: string;
  actor: string | null;
  action: string;
  detail: string | null;
}

export type GuardDocumentKind =
  "License" | "Clearance" | "MedicalCertificate" | "SafetyCredential" | "Other";

export interface GuardVaultRow {
  guardId: string;
  code: string;
  name: string;
  clientId: string;
  documents: number;
  nextExpiry: string | null;
  expired: number;
  expiringSoon: number;
}

export interface GuardDocument {
  id: string;
  guardId: string;
  guardName: string;
  clientId: string;
  kind: GuardDocumentKind;
  title: string;
  number: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
  status: "NoExpiry" | "Valid" | "ExpiringSoon" | "Expired";
  daysToExpiry: number | null;
  fileName: string;
  uploadedBy: string;
}

export interface PortalNotice {
  id: string;
  clientId: string | null;
  title: string;
  body: string;
  pinned: boolean;
  publishAt: string;
  expiresAt: string | null;
  createdBy: string;
  state: "Scheduled" | "Live" | "Expired";
}

export interface ScoreMonth {
  period: string;
  average: number;
  count: number;
}

export interface ScorecardRow {
  kind: "Site" | "Guard";
  targetId: string;
  name: string;
  clientName: string;
  average: number;
  count: number;
  months: ScoreMonth[];
}

export interface Scorecard {
  rows: ScorecardRow[];
  comments: {
    kind: string;
    target: string;
    clientName: string;
    stars: number;
    comment: string;
    by: string;
    period: string;
  }[];
}

export type ManpowerStatus = "Pending" | "Approved" | "Declined" | "Cancelled";

export interface ManpowerRequestRow {
  id: string;
  clientId: string;
  clientName: string;
  siteId: string;
  siteName: string;
  kind: "ExtraGuards" | "ScheduleChange";
  fromDate: string;
  toDate: string;
  startTime: string | null;
  endTime: string | null;
  guardsNeeded: number;
  permanent: boolean;
  reason: string;
  details: string | null;
  status: ManpowerStatus;
  raisedBy: string;
  createdAt: string;
  decisionNote: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  dispatchedAt: string | null;
}

export interface InvoiceDetail {
  summary: InvoiceSummary;
  memos: Memo[];
  subtotal: number;
  vatAmount: number;
  withholdingExpected: number;
  notes: string | null;
  fileName: string | null;
  voidReason: string | null;
  createdBy: string;
  submittedBy: string | null;
  submittedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  issuedBy: string | null;
  issuedAt: string | null;
  voidedBy: string | null;
  voidedAt: string | null;
  dtrSummaryRecords: number;
  lines: InvoiceLine[];
  deliveries: InvoiceDelivery[];
  payments: PaymentSummary[];
}

export interface InvoicePage {
  rows: InvoiceSummary[];
  total: number;
}

export interface Payment {
  summary: PaymentSummary;
  clientId: string;
  clientName: string;
  checkNumber: string | null;
  checkBank: string | null;
  checkDate: string | null;
  notes: string | null;
  submittedBy: string;
  reviewedBy: string | null;
}

export interface ClientFlag {
  id: string;
  recordId: string;
  workDate: string;
  guardName: string;
  siteName: string;
  userName: string;
  comment: string;
  at: string;
  resolved: boolean;
}
