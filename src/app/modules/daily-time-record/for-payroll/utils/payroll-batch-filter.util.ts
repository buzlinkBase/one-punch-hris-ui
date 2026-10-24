import dayjs from "dayjs";
import type { PayrollBatchListModel } from "../models/api/response/payroll-batch-list.model";
import { PAYROLL_TYPE_LABEL } from "../constants/label.const";
import {
  matchesBatchStatus,
  type BatchStatusFilter,
} from "@/shared/utils/batch-status-filter.util";

export interface PayrollBatchFilters {
  search: string;
  status: BatchStatusFilter;
  payrollType: PayrollBatchListModel["payrollType"] | "all";
}

export const DEFAULT_PAYROLL_BATCH_FILTERS: PayrollBatchFilters = {
  search: "",
  status: "all",
  payrollType: "all",
};

export const countActivePayrollBatchFilters = (f: PayrollBatchFilters) =>
  Number(!!f.search.trim()) +
  Number(f.status !== "all") +
  Number(f.payrollType !== "all");

export function filterPayrollBatches(
  batches: PayrollBatchListModel[],
  filters: PayrollBatchFilters,
  employeeName: (id?: string | null) => string | undefined,
): PayrollBatchListModel[] {
  const q = filters.search.trim().toLowerCase();
  return batches.filter((b) => {
    if (
      !matchesBatchStatus(filters.status, b.approvalStatus, b.pendingDeletion)
    )
      return false;
    if (filters.payrollType !== "all" && b.payrollType !== filters.payrollType)
      return false;
    if (!q) return true;
    const haystack = [
      b.remarks,
      employeeName(b.generatedByEmployeeId),
      PAYROLL_TYPE_LABEL[b.payrollType],
      dayjs(b.payPeriodStart).format("MMM DD YYYY"),
      dayjs(b.payPeriodEnd).format("MMM DD YYYY"),
      b.payDate ? dayjs(b.payDate).format("MMM DD YYYY") : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
