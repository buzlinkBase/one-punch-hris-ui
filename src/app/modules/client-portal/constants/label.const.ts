export const CLIENT_PORTAL_PERMISSION = {
  MANAGE: "clientportal:Client:Manage",
} as const;

/** Billing is split so the person who prepares an invoice is not automatically the one who approves or sends it. */
export const BILLING_PERMISSION = {
  VIEW: "clientportal:Billing:View",
  MANAGE: "clientportal:Billing:Manage",
  APPROVE: "clientportal:Billing:Approve",
  ISSUE: "clientportal:Billing:Issue",
} as const;

/** Guard documents, notices, manpower requests and the ratings scorecard. */
export const OPERATIONS_PERMISSION = {
  VIEW: "clientportal:Operations:View",
  MANAGE: "clientportal:Operations:Manage",
} as const;

export const DOCUMENT_KIND_OPTIONS = [
  { value: "License", label: "Security license" },
  { value: "Clearance", label: "Clearance (NBI / police)" },
  { value: "MedicalCertificate", label: "Medical certificate" },
  { value: "SafetyCredential", label: "Safety credential / training" },
  { value: "Other", label: "Other" },
];

export const BILLING_PATH = {
  INVOICES: "/client-portal/invoices",
  invoice: (id: string) => `/client-portal/invoices/${id}`,
  PAYMENTS: "/client-portal/payments",
  SETUP: "/client-portal/billing-setup",
  FORMATS: "/client-portal/billing-formats",
  RUNS: "/client-portal/billing-runs",
} as const;

export const BILLING_FORMAT_LABEL = {
  FORMATS_TITLE: "Billing Formats",
  FORMATS_SUBTITLE:
    "How each kind of client is billed: the pricing method, agency fee and taxes, and what the billing packet contains (sections, columns, signatures). One format can serve many clients.",
  BUILT_IN_HELP:
    "Built-in formats are ready to use in a client's billing arrangements and can't be changed. To bill a client differently, copy one and edit the copy.",
  BUILT_IN_TAG: "Built-in",
  BUILT_IN_READ_ONLY:
    "This is a built-in format and can't be changed. To use different settings, copy it from the formats list and edit the copy.",
  RUNS_TITLE: "Billing Runs",
  RUNS_SUBTITLE:
    "Bill a client for a period: every billing arrangement of the client becomes its own draft invoice, all under one reference number. Preview first to see the amounts and anything that blocks billing.",
  ARRANGEMENTS_TITLE: "Billing arrangements",
  ARRANGEMENTS_HELP:
    "The ways this client is billed each cycle (for example regular posting, a sub-area, augmentation, holiday premium). Each one uses a billing format and has billing lines with their own headcount and rates.",
};

export const PRICING_METHOD_OPTIONS: { value: string; label: string }[] = [
  {
    value: "ContractDeduction",
    label: "Contract rate, less hours not rendered",
  },
  { value: "RequiredVsActual", label: "Required vs actual hours" },
  { value: "DailyActual", label: "Daily rate x days worked" },
  { value: "HourlyActual", label: "Hourly rate x hours worked" },
  { value: "Fixed", label: "Fixed amount per cutoff" },
  { value: "HolidayPremium", label: "Holiday premium" },
];

export const PRICING_METHOD_LABEL: Record<string, string> = Object.fromEntries(
  PRICING_METHOD_OPTIONS.map((o) => [o.value, o.label]),
);

export const RATE_BASIS_OPTIONS = [
  { value: "MonthlyPerHead", label: "Per month (per head)" },
  { value: "DailyPerHead", label: "Per day (per head)" },
  { value: "Hourly", label: "Per hour" },
];

export const AGENCY_FEE_MODE_OPTIONS = [
  { value: "PercentOfBase", label: "Percent of the personnel amount" },
  { value: "FixedPerHeadMonthly", label: "Fixed amount per head per month" },
  { value: "None", label: "No agency fee" },
];

export const TAX_BASE_OPTIONS = [
  { value: "AgencyFee", label: "Agency fee only" },
  { value: "Total", label: "Personnel amount + agency fee" },
  { value: "None", label: "Not charged" },
];

export const ROUNDING_OPTIONS = [
  { value: "FullPrecision", label: "Full precision, round only the totals" },
  { value: "RoundEachStep", label: "Round every line, fee and tax" },
  { value: "RoundUnitRates", label: "Round the per-day fee and VAT first" },
];

export const ATTACHMENT_CATEGORY_OPTIONS = [
  { value: "SignedDtr", label: "Signed DTR" },
  { value: "OvertimeRequest", label: "Overtime request form" },
  { value: "MissedLogForm", label: "Missed log form" },
  { value: "OfficialInvoice", label: "Official sales invoice" },
  { value: "Annex", label: "Annex" },
  { value: "Other", label: "Other" },
];

export const BILLING_LABEL = {
  INVOICES_TITLE: "Invoices",
  INVOICES_SUBTITLE:
    "Prepare invoices from verified time logs or upload your own, review and approve them, then send them to the client or keep them as a record.",
  PAYMENTS_TITLE: "Client Payments",
  PAYMENTS_SUBTITLE:
    "Record payments, review the proofs of payment clients upload, and apply payments to invoices.",
  SETUP_TITLE: "Billing Setup",
  SETUP_SUBTITLE:
    "Each client's billing details, payment terms, taxes and contract rates.",
};

export const INVOICE_STATUS_TAG: Record<
  string,
  { color: string; label: string }
> = {
  Draft: { color: "default", label: "Draft" },
  ForReview: { color: "orange", label: "Under review" },
  Approved: { color: "blue", label: "Approved" },
  Issued: { color: "geekblue", label: "Issued" },
  PartiallyPaid: { color: "gold", label: "Partially paid" },
  Paid: { color: "green", label: "Paid" },
  Overdue: { color: "red", label: "Overdue" },
  Voided: { color: "default", label: "Void" },
};

export const PAYMENT_METHOD_OPTIONS = [
  { value: "BankTransfer", label: "Bank transfer" },
  { value: "Check", label: "Check" },
  { value: "Cash", label: "Cash" },
  { value: "Online", label: "Online payment" },
];

export const RATE_UNIT_OPTIONS = [
  { value: "PerHour", label: "Per hour" },
  { value: "PerDay", label: "Per day (one guard, one shift)" },
  { value: "PerMonth", label: "Per month (one guard)" },
];

export const peso = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    amount,
  );

export const CLIENT_PORTAL_PATH = {
  CLIENTS: "/client-portal/clients",
  INTEGRATIONS: "/client-portal/integrations",
  VERIFICATION: "/client-portal/verification",
  CONNECTION: "/client-portal/connection",
} as const;

export const CLIENT_PORTAL_LABEL = {
  CLIENTS_TITLE: "Portal Clients",
  CLIENTS_SUBTITLE:
    "Client companies come from the HRIS client list and appear here automatically. Switch a client's portal access on or off (every user under it follows) and choose the sections each one may use. Invite a client's first administrator from Security > Users.",
  INTEGRATIONS_TITLE: "Integrations",
  INTEGRATIONS_SUBTITLE:
    "Systems allowed to push time records and invoices into the client portal. Each one signs in with its own API key.",
  CONNECTION_TITLE: "Portal Connection",
  CONNECTION_SUBTITLE:
    "Where this company sends approved time records, and the key it signs in with. Records are sent automatically each time a DTR batch is approved.",
  VERIFICATION_TITLE: "DTR Verification",
  VERIFICATION_SUBTITLE:
    "Verify and lock a period of time logs so the client can review and sign it off. Verified logs can no longer be changed.",
  SECTIONS_APPLY: "Apply",
  SECTIONS_RESET: "Reset",
  SECTIONS_UPDATED: "Portal sections updated.",
};

/** Portal sections the agency can switch on per client (the Access section is always on). */
export const PORTAL_MODULE_OPTIONS: { key: string; label: string }[] = [
  { key: "TimeLogs", label: "Time logs" },
  { key: "Invoicing", label: "Invoices" },
  { key: "Payments", label: "Payments" },
  { key: "Disputes", label: "Billing disputes" },
  { key: "Reports", label: "Reports" },
  { key: "IncidentReports", label: "Incident reports" },
  { key: "Training", label: "Training" },
  { key: "Quotations", label: "Quotations" },
  { key: "DocumentVault", label: "Document vault" },
  { key: "Manpower", label: "Manpower requests" },
  { key: "Ratings", label: "Service ratings" },
  { key: "NoticeBoard", label: "Notice board" },
];

export const ANOMALY_LABEL: Record<string, string> = {
  MissingTimeOut: "Missing time-out",
  MissingTimeIn: "Missing time-in",
  DuplicatePunch: "Duplicate punch",
};
