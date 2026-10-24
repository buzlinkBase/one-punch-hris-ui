import type {
  DeductionApplicationDetailResponse,
  DeductionApplicationResponse,
} from "@/app/modules/applications/deduction-application/models/api/response/deduction-application-response.model";

export type LedgerRowState = "paid" | "next" | "upcoming" | "skipped";

export interface DeductionLedgerRow {
  id: string;
  installment: number;
  date: string;
  amount: number;
  balance: number;
  state: LedgerRowState;
  isDeferred: boolean;
  note: string;
}

export interface LoanSummary {
  loan: DeductionApplicationResponse;
  balance: number;
  paidAmount: number;
  paidCount: number;
  totalCount: number;
  next: DeductionApplicationDetailResponse | null;
}

// An installment's own balance is what is still owed on that payment: its amount until payroll
// takes it, then 0. So "paid" is balance 0, and the loan's balance is the sum of the open ones.
const isOpen = (d: DeductionApplicationDetailResponse) =>
  !d.isSkipped && d.status !== "Paid" && d.balance > 0;

const sortedBreakdown = (loan: DeductionApplicationResponse) =>
  [...(loan.breakdown ?? [])].sort((a, b) => a.recordOrder - b.recordOrder);

/** Strips the trailing "Z" so dates render as stored, not shifted to local time. */
export const toLocalDate = (value: string) =>
  value?.replace(/Z$/, "").split("T")[0] ?? "";

export function summarizeLoan(loan: DeductionApplicationResponse): LoanSummary {
  const rows = sortedBreakdown(loan).filter((d) => !d.isSkipped);
  const open = rows.filter(isOpen);
  const balance = open.reduce((sum, d) => sum + d.balance, 0);
  const total = rows.reduce((sum, d) => sum + d.amount, 0);
  return {
    loan,
    balance,
    paidAmount: Math.max(0, total - balance),
    paidCount: rows.length - open.length,
    totalCount: rows.length,
    next: open[0] ?? null,
  };
}

/** Active = approved and still has an open installment with a balance left. */
export function isActiveLoan(loan: DeductionApplicationResponse): boolean {
  if ((loan.approvalStatus ?? "Approved") !== "Approved") return false;
  return (loan.breakdown ?? []).some(isOpen);
}

export function buildLedgerRows(
  loan: DeductionApplicationResponse,
): DeductionLedgerRow[] {
  const sorted = sortedBreakdown(loan);
  const nextId = sorted.find(isOpen)?.id;
  // A skipped installment is forgiven, so it never reduces the remaining total.
  let remaining = sorted
    .filter((d) => !d.isSkipped)
    .reduce((sum, d) => sum + d.amount, 0);
  return sorted.map((d, i) => {
    if (!d.isSkipped) remaining = Math.max(0, remaining - d.amount);
    return {
      id: d.id,
      installment: i + 1,
      date: toLocalDate(d.date),
      amount: d.amount,
      balance: +remaining.toFixed(4),
      state: d.isSkipped
        ? "skipped"
        : !isOpen(d)
          ? "paid"
          : d.id === nextId
            ? "next"
            : "upcoming",
      isDeferred: !!d.isDeferred,
      note: d.skipReason || d.notes || "",
    };
  });
}
