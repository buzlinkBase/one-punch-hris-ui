/** A client as HRIS keeps it; the portal's copy carries this same id. */
export interface HrisClientRef {
  id: string;
  code: string;
  name: string;
}

export interface InviteClientAdminRequest {
  email: string;
  fullName: string;
  roleIds: string[];
  siteIds: string[];
  makeClientAdmin: boolean;
  /** Invite for an HRIS client the portal may not have yet: the portal creates it first. */
  hrisClient?: HrisClientRef;
}

export interface PortalConnectionRequest {
  enabled: boolean;
  portalUrl: string;
  /** Empty keeps the key already saved. */
  apiKey: string | null;
}

export interface GenerateInvoiceRequest {
  clientId: string;
  from: string;
  to: string;
  siteId: string | null;
  notes: string | null;
}

export interface RateRequest {
  siteId: string | null;
  shiftName: string | null;
  unit: "PerHour" | "PerDay" | "PerMonth";
  amount: number;
  hoursPerDay: number;
  daysPerMonth: number;
  effectiveFrom: string;
}

export interface AllocationRequest {
  invoiceId: string;
  amount: number;
}

export interface RecordPaymentRequest {
  clientId: string;
  paymentDate: string;
  amount: number;
  method: "BankTransfer" | "Check" | "Cash" | "Online";
  reference: string;
  checkNumber: string | null;
  checkBank: string | null;
  checkDate: string | null;
  receiptNumber: string | null;
  notes: string | null;
  allocations: AllocationRequest[];
}

export interface VerifyPeriodRequest {
  clientId: string;
  from: string;
  to: string;
  siteId: string | null;
}
