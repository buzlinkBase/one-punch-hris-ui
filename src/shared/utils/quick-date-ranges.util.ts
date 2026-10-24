import dayjs from "dayjs";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";

const F = "YYYY-MM-DD";

export interface QuickRange {
  key: string;
  label: string;
  range: () => [string, string];
}

// Date-range shortcuts shared by every batch-list filter bar (Saved Payroll / Saved DTR / DTR
// Summary / Payroll Summary).
export const QUICK_RANGES: QuickRange[] = [
  {
    key: "cutoff",
    label: "Current cutoff",
    range: () => {
      const { fromDate, toDate } = getSemiMonthlyCutoff();
      return [fromDate, toDate];
    },
  },
  {
    key: "thisMonth",
    label: "This month",
    range: () => [
      dayjs().startOf("month").format(F),
      dayjs().endOf("month").format(F),
    ],
  },
  {
    key: "lastMonth",
    label: "Last month",
    range: () => [
      dayjs().subtract(1, "month").startOf("month").format(F),
      dayjs().subtract(1, "month").endOf("month").format(F),
    ],
  },
  {
    key: "last3Months",
    label: "Last 3 months",
    range: () => [
      dayjs().subtract(2, "month").startOf("month").format(F),
      dayjs().endOf("month").format(F),
    ],
  },
  {
    key: "thisYear",
    label: "This year",
    range: () => [
      dayjs().startOf("year").format(F),
      dayjs().endOf("year").format(F),
    ],
  },
];
