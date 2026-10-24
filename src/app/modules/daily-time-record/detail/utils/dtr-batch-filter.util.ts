import dayjs from "dayjs";
import type { BatchesModel } from "../../summary/models/api/response/batches.model";
import {
  matchesBatchStatus,
  type BatchStatusFilter,
} from "@/shared/utils/batch-status-filter.util";

export type DtrBatchStageFilter =
  "all" | "posted" | "unposted" | "payrollGenerated";

export const DTR_BATCH_STAGE_OPTIONS: {
  value: DtrBatchStageFilter;
  label: string;
}[] = [
  { value: "all", label: "All stages" },
  { value: "unposted", label: "Not posted" },
  { value: "posted", label: "Posted" },
  { value: "payrollGenerated", label: "Payroll generated" },
];

export interface DtrBatchFilters {
  search: string;
  status: BatchStatusFilter;
  payrollGroupId: string | undefined;
  stage: DtrBatchStageFilter;
}

export const DEFAULT_DTR_BATCH_FILTERS: DtrBatchFilters = {
  search: "",
  status: "all",
  payrollGroupId: undefined,
  stage: "all",
};

export const countActiveDtrBatchFilters = (f: DtrBatchFilters) =>
  Number(!!f.search.trim()) +
  Number(f.status !== "all") +
  Number(!!f.payrollGroupId) +
  Number(f.stage !== "all");

const matchesStage = (b: BatchesModel, stage: DtrBatchStageFilter) => {
  switch (stage) {
    case "posted":
      return !!b.isPosted;
    case "unposted":
      return !b.isPosted;
    case "payrollGenerated":
      return !!b.isPayrollGenerated;
    default:
      return true;
  }
};

export function filterDtrBatches(
  batches: BatchesModel[],
  filters: DtrBatchFilters,
  employeeName: (id?: string | null) => string | undefined,
): BatchesModel[] {
  const q = filters.search.trim().toLowerCase();
  return batches.filter((b) => {
    if (
      !matchesBatchStatus(filters.status, b.approvalStatus, b.pendingDeletion)
    )
      return false;
    if (filters.payrollGroupId && b.payrollGroupId !== filters.payrollGroupId)
      return false;
    if (!matchesStage(b, filters.stage)) return false;
    if (!q) return true;
    const haystack = [
      b.code,
      b.postingDescription,
      b.generatedByName ?? employeeName(b.generatedByEmployeeId),
      b.fromDate ? dayjs(b.fromDate).format("MMM DD YYYY") : "",
      b.toDate ? dayjs(b.toDate).format("MMM DD YYYY") : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
