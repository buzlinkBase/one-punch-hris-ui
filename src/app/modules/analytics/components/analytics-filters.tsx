import { Button, Select } from "antd";
import dayjs from "dayjs";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { EMPLOYMENT_STATUS_OPTIONS } from "@/app/modules/setup/employee/constants/label.const";
import type { AnalyticsFilter } from "../models/analytics.model";
import { ANALYTICS_DATE_FORMAT } from "../utils/analytics-filter";

interface AnalyticsFiltersProps {
  value: AnalyticsFilter;
  onChange: (next: AnalyticsFilter) => void;
}

type OptionalKey =
  "departmentId" | "branchId" | "payrollGroupId" | "employmentStatus";

/** The one filter row every Analytics page shares: date range, then who's included. */
export function AnalyticsFilters({ value, onChange }: AnalyticsFiltersProps) {
  const { data: departments = [] } = useDepartments();
  const { data: branches = [] } = useBranches();
  const { data: payrollGroups = [] } = usePayrollGroups();

  const set = (key: OptionalKey, next: string | undefined) =>
    onChange({ ...value, [key]: next || undefined });

  const hasFilters =
    value.departmentId ||
    value.branchId ||
    value.payrollGroupId ||
    value.employmentStatus;

  const selectProps = {
    allowClear: true,
    showSearch: true,
    optionFilterProp: "label" as const,
    className: "w-full sm:w-44",
  };

  return (
    <div className="mb-4 flex flex-wrap items-start gap-2">
      <MobileRangePicker
        className="w-full sm:w-auto"
        allowClear={false}
        value={[dayjs(value.from), dayjs(value.to)]}
        onChange={(range) => {
          const [from, to] = range ?? [null, null];
          if (!from || !to) return;
          onChange({
            ...value,
            from: from.format(ANALYTICS_DATE_FORMAT),
            to: to.format(ANALYTICS_DATE_FORMAT),
          });
        }}
      />
      <Select
        {...selectProps}
        placeholder="All departments"
        value={value.departmentId}
        onChange={(v?: string) => set("departmentId", v)}
        options={departments.map((d) => ({ value: d.id, label: d.name }))}
      />
      <Select
        {...selectProps}
        placeholder="All branches"
        value={value.branchId}
        onChange={(v?: string) => set("branchId", v)}
        options={branches.map((b) => ({ value: b.id, label: b.name }))}
      />
      <Select
        {...selectProps}
        placeholder="All payroll groups"
        value={value.payrollGroupId}
        onChange={(v?: string) => set("payrollGroupId", v)}
        options={payrollGroups.map((g) => ({ value: g.id, label: g.name }))}
      />
      <Select
        {...selectProps}
        placeholder="All statuses"
        value={value.employmentStatus}
        onChange={(v?: string) => set("employmentStatus", v)}
        options={EMPLOYMENT_STATUS_OPTIONS}
      />
      {hasFilters && (
        <Button
          type="link"
          onClick={() => onChange({ from: value.from, to: value.to })}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
