import dayjs from "dayjs";
import type { PayrollBatchListModel } from "../../../models/api/response/payroll-batch-list.model";
import {
  APPROVAL_STATUS_LABEL,
  PAYROLL_TYPE_LABEL,
} from "../../../constants/label.const";

export interface PayrollBatchOption {
  value: string;
  // Compact single line: what the closed select shows and what the search box matches against.
  label: string;
  // First line of the dropdown row: the batch's saved remarks, or null when it has none.
  remarks: string | null;
  // Second line of the dropdown row: what tells same-period generations apart.
  detail: string;
}

const formatPeriod = (b: PayrollBatchListModel) =>
  `${dayjs(b.payPeriodStart).format("MMM D")} – ${dayjs(b.payPeriodEnd).format("MMM D, YYYY")}`;

const statusLabel = (b: PayrollBatchListModel) =>
  b.pendingDeletion
    ? "Pending Deletion"
    : (APPROVAL_STATUS_LABEL[b.approvalStatus] ?? b.approvalStatus);

// Several runs can cover the same period and type (a re-generation, a per-client run, a
// correction), so the period alone is ambiguous. Everything that distinguishes them is added:
// the saved remarks lead the label, then period, type, status, how many employees it covers, and
// the payout date and who generated it when known.
export const buildPayrollBatchOption = (
  b: PayrollBatchListModel,
  generatedByName?: string,
): PayrollBatchOption => {
  const remarks = b.remarks?.trim() || null;
  const type = PAYROLL_TYPE_LABEL[b.payrollType] ?? b.payrollType;
  const employees = `${b.employeeCount} ${b.employeeCount === 1 ? "employee" : "employees"}`;

  const detailParts = [
    `${formatPeriod(b)} · ${type}`,
    statusLabel(b),
    employees,
    b.payDate ? `Payout ${dayjs(b.payDate).format("MMM D")}` : null,
    generatedByName ? `by ${generatedByName}` : null,
  ];
  const detail = detailParts.filter(Boolean).join(" · ");

  return {
    value: b.id,
    label: remarks ? `${remarks} — ${detail}` : detail,
    remarks,
    detail,
  };
};

// Last resort for two runs that are identical in every visible respect: a short id suffix, so the
// user can still tell the rows apart (and the same row stays the same one across reloads).
export const buildPayrollBatchOptions = (
  batches: PayrollBatchListModel[],
  employeeName: (id?: string | null) => string | undefined = () => undefined,
): PayrollBatchOption[] => {
  const options = batches.map((b) =>
    buildPayrollBatchOption(b, employeeName(b.generatedByEmployeeId)),
  );

  const counts = new Map<string, number>();
  for (const o of options) counts.set(o.label, (counts.get(o.label) ?? 0) + 1);

  return options.map((o) =>
    (counts.get(o.label) ?? 0) > 1
      ? {
          ...o,
          label: `${o.label} · #${o.value.slice(-4)}`,
          detail: `${o.detail} · #${o.value.slice(-4)}`,
        }
      : o,
  );
};
