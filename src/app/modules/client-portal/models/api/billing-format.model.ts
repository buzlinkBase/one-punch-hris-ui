import type { InvoiceSummary } from "./response/client-portal-response.model";

// ---- billing formats ----

export type PricingMethod =
  | "ContractDeduction"
  | "RequiredVsActual"
  | "DailyActual"
  | "HourlyActual"
  | "Fixed"
  | "HolidayPremium";
export type RateBasis = "MonthlyPerHead" | "DailyPerHead" | "Hourly";
export type AgencyFeeMode = "None" | "PercentOfBase" | "FixedPerHeadMonthly";
export type TaxBase = "None" | "AgencyFee" | "Total";
export type RoundingMode = "FullPrecision" | "RoundEachStep" | "RoundUnitRates";
export type SignatorySide = "Agency" | "Client";
export type SignatoryWorkflowRole = "None" | "Preparer" | "Approver";

export interface SectionConfig {
  type: string;
  title: string | null;
  columns: string[] | null;
  fillerRows: number;
  landscape: boolean;
  clientVisible: boolean;
  options: Record<string, string> | null;
}

export interface SignatorySlot {
  label: string;
  side: SignatorySide;
  name: string | null;
  title: string | null;
  organization: string | null;
  sections: string[] | null;
  workflowRole: SignatoryWorkflowRole;
}

export interface SignatoryOverride {
  label: string;
  name: string | null;
  title: string | null;
  organization: string | null;
}

export interface BillingFormatRequest {
  name: string;
  description: string | null;
  title: string;
  method: PricingMethod;
  inclusive: boolean;
  cutoffsPerMonth: number;
  daysPerMonth: number;
  hoursPerDay: number;
  regularHoursPerDay: number;
  overtimeMultiplier: number;
  holidayMultiplier: number;
  nightDiffRate: number;
  agencyFeeMode: AgencyFeeMode;
  agencyFeeRate: number;
  vatBase: TaxBase;
  vatRate: number;
  withholdingBase: TaxBase;
  withholdingRate: number;
  rounding: RoundingMode;
  sections: SectionConfig[];
  signatories: SignatorySlot[];
  terminology: Record<string, string>;
}

export interface BillingFormat extends BillingFormatRequest {
  id: string;
  presetKey: string | null;
  /** Comes with the portal and is read-only; copy it to change it. */
  isBuiltIn: boolean;
  version: number;
  isActive: boolean;
  usedBy: number;
  updatedAt: string;
  updatedBy: string;
}

export interface BillingFormatSummary {
  id: string;
  name: string;
  description: string | null;
  method: PricingMethod;
  version: number;
  isActive: boolean;
  isBuiltIn: boolean;
  usedBy: number;
  updatedAt: string;
}

export interface SectionColumn {
  key: string;
  label: string;
}

export interface SectionOption {
  key: string;
  label: string;
  default: string;
}

export interface SectionType {
  key: string;
  name: string;
  description: string;
  columns: SectionColumn[];
  defaultColumns: string[];
  options: SectionOption[];
  hasSignatures: boolean;
}

export interface FormatCatalog {
  sections: SectionType[];
}

// ---- number series ----

export type NumberSeriesPurpose = "Invoice" | "Reference";
export type NumberingMode = "Auto" | "Manual";

export interface NumberSeriesRequest {
  name: string;
  purpose: NumberSeriesPurpose;
  mode: NumberingMode;
  pattern: string;
  nextValue: number;
  resetYearly: boolean;
  isActive: boolean;
}

export interface NumberSeries extends NumberSeriesRequest {
  id: string;
  nextPreview: string;
}

// ---- arrangements ----

export interface ArrangementGroupRequest {
  id: string | null;
  code: string;
  label: string;
  siteId: string | null;
  postId: string | null;
  shiftName: string | null;
}

export interface ArrangementRequest {
  name: string;
  billingFormatId: string;
  siteId: string | null;
  scopeLabel: string | null;
  documentTitle: string | null;
  numberSeriesId: string | null;
  signatoryOverrides: SignatoryOverride[];
  sortOrder: number;
  isActive: boolean;
  groups: ArrangementGroupRequest[];
}

export interface PostOption {
  id: string;
  siteId: string;
  siteName: string;
  code: string;
  name: string;
}

export interface ArrangementRateRequest {
  headcount: number;
  basis: RateBasis;
  amount: number;
  agencyFeeMonthly: number | null;
  displayRate: number | null;
  effectiveFrom: string;
}

export interface ArrangementRate extends ArrangementRateRequest {
  id: string;
  createdBy: string;
  createdAt: string;
}

export interface ArrangementGroup {
  id: string;
  sortOrder: number;
  code: string;
  label: string;
  siteId: string | null;
  siteName: string | null;
  postId: string | null;
  postName: string | null;
  shiftName: string | null;
  currentRate: ArrangementRate | null;
  rates: ArrangementRate[];
}

export interface Arrangement {
  id: string;
  clientId: string;
  name: string;
  billingFormatId: string;
  formatName: string;
  method: PricingMethod;
  siteId: string | null;
  siteName: string | null;
  scopeLabel: string | null;
  documentTitle: string | null;
  numberSeriesId: string | null;
  numberSeriesName: string | null;
  signatoryOverrides: SignatoryOverride[];
  sortOrder: number;
  isActive: boolean;
  groups: ArrangementGroup[];
}

// ---- pricing results and billing runs ----

export interface WorkTotals {
  days: number;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  nightDiffHours: number;
}

export interface PricedLine {
  code: string;
  label: string;
  amount: number;
  quantity: number | null;
  unit: string | null;
  rate: number | null;
}

export interface PricedGroup {
  key: string;
  label: string;
  headcount: number;
  hourlyRate: number;
  required: WorkTotals;
  actual: WorkTotals;
  lines: PricedLine[];
  base: number;
  agencyFee: number;
  vat: number;
  gross: number;
  withholding: number;
  net: number;
}

export interface PricedResult {
  groups: PricedGroup[];
  base: number;
  agencyFee: number;
  vat: number;
  gross: number;
  withholding: number;
  net: number;
  sales: { vatable: number; exempt: number; zeroRated: number; vat: number };
}

export interface BillingIssue {
  code: string;
  message: string;
  blocking: boolean;
  arrangementId: string | null;
}

export interface ArrangementPreview {
  arrangementId: string;
  name: string;
  formatName: string;
  method: PricingMethod;
  recordCount: number;
  result: PricedResult | null;
  issues: BillingIssue[];
}

export interface BillingRunRequest {
  clientId: string;
  from: string;
  to: string;
  arrangementIds: string[] | null;
  referenceNo: string | null;
  notes: string | null;
}

export interface BillingRunPreview {
  clientId: string;
  from: string;
  to: string;
  recordCount: number;
  unmatchedRecords: number;
  arrangements: ArrangementPreview[];
  issues: BillingIssue[];
  canGenerate: boolean;
  total: number;
}

export interface BillingRun {
  id: string;
  clientId: string;
  clientName: string;
  periodFrom: string;
  periodTo: string;
  referenceNo: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  invoices: InvoiceSummary[];
  total: number;
}

// ---- carried-over adjustments ----

export type AdjustmentStatus = "Pending" | "Applied" | "Cancelled";

export interface CreateBillingAdjustmentRequest {
  clientId: string;
  arrangementId: string | null;
  /** A personnel amount: positive bills the client, negative credits them. */
  amount: number;
  description: string;
  reason: string;
}

export interface BillingAdjustment {
  id: string;
  clientId: string;
  arrangementId: string | null;
  arrangementName: string | null;
  amount: number;
  description: string;
  reason: string;
  disputeId: string | null;
  sourceInvoiceId: string | null;
  status: AdjustmentStatus;
  appliedInvoiceId: string | null;
  appliedInvoiceNumber: string | null;
  appliedAt: string | null;
  createdBy: string;
  createdAt: string;
}

// ---- invoice attachments ----

export type AttachmentCategory =
  | "Annex"
  | "OfficialInvoice"
  | "SignedDtr"
  | "OvertimeRequest"
  | "MissedLogForm"
  | "Other";

export interface AttachmentRequest {
  category: AttachmentCategory;
  title: string;
  sortOrder: number;
  includeInPacket: boolean;
  visibleToClient: boolean;
}

export interface InvoiceAttachment extends AttachmentRequest {
  id: string;
  invoiceId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
}

// ---- billing document (the packet as data) ----

export interface DocumentHeader {
  agencyName: string;
  title: string;
  clientName: string;
  clientAddress: string | null;
  clientTin: string | null;
  scopeLabel: string | null;
  referenceNo: string | null;
  invoiceNumber: string | null;
  invoiceDate: string;
  periodFrom: string;
  periodTo: string;
  status: string;
}

export interface TableCell {
  text: string;
  number: number | null;
  bold: boolean;
  shade: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  align: "Left" | "Right" | "Center";
  group: string | null;
}

export type DocumentBlock =
  | {
      kind: "fields";
      fields: { label: string; value: string }[];
      columns: number;
    }
  | {
      kind: "table";
      caption: string | null;
      columns: TableColumn[];
      rows: TableCell[][];
      footer: TableCell[][];
      compact: boolean;
    }
  | {
      kind: "amounts";
      caption: string | null;
      lines: {
        label: string;
        amount: number;
        quantity: number | null;
        unit: string | null;
        rate: number | null;
        emphasis: "Normal" | "Subtotal" | "Total";
      }[];
    }
  | {
      kind: "signatures";
      signatures: {
        label: string;
        name: string | null;
        title: string | null;
        organization: string | null;
      }[];
    }
  | { kind: "note"; text: string };

export interface DocumentSection {
  type: string;
  title: string;
  landscape: boolean;
  pages: { heading: string | null; blocks: DocumentBlock[] }[];
}

export interface BillingDocument {
  header: DocumentHeader;
  sections: DocumentSection[];
  annexes: {
    id: string;
    title: string;
    fileName: string;
    contentType: string;
  }[];
}
