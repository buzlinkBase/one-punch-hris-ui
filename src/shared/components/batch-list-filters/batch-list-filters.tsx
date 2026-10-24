import type { ReactNode } from "react";
import { Button, Input, Select, Typography } from "antd";
import {
  ClearOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import {
  BATCH_STATUS_FILTER_OPTIONS,
  type BatchStatusFilter,
} from "@/shared/utils/batch-status-filter.util";
import { QUICK_RANGES } from "@/shared/utils/quick-date-ranges.util";

const { Text } = Typography;

const DATE_FORMAT = "YYYY-MM-DD";

interface Props {
  dateRange: [string, string];
  onDateRangeChange: (range: [string, string]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  status: BatchStatusFilter;
  onStatusChange: (value: BatchStatusFilter) => void;
  /** Feature-specific selects (run type, payroll group, ...). */
  extra?: ReactNode;
  activeFilterCount: number;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  shownCount: number;
  totalCount: number;
  noun: string;
}

// Filter bar shared by the Saved Payroll Runs and Saved DTR tabs. Presentational only -- each tab
// owns its filter state and applies it with its own pure filter util.
export function BatchListFilters({
  dateRange,
  onDateRangeChange,
  search,
  onSearchChange,
  searchPlaceholder,
  status,
  onStatusChange,
  extra,
  activeFilterCount,
  onReset,
  onRefresh,
  isRefreshing,
  shownCount,
  totalCount,
  noun,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1">
          {QUICK_RANGES.map((q) => {
            const [from, to] = q.range();
            const active = dateRange[0] === from && dateRange[1] === to;
            return (
              <Button
                key={q.key}
                size="small"
                type={active ? "primary" : "default"}
                onClick={() => onDateRangeChange([from, to])}
              >
                {q.label}
              </Button>
            );
          })}
        </div>
        <MobileRangePicker
          allowClear={false}
          value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
          onChange={(dates) => {
            if (dates?.[0] && dates[1])
              onDateRangeChange([
                dates[0].format(DATE_FORMAT),
                dates[1].format(DATE_FORMAT),
              ]);
          }}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-72"
        />
        <Select
          value={status}
          onChange={onStatusChange}
          options={BATCH_STATUS_FILTER_OPTIONS}
          className="w-full sm:w-44"
        />
        {extra}
        <div className="flex gap-2 sm:ml-auto">
          <Button
            icon={<ClearOutlined />}
            disabled={activeFilterCount === 0}
            onClick={onReset}
          >
            Clear filters
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={isRefreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Text type="secondary" className="text-xs">
        Showing {shownCount} of {totalCount} {noun}
        {totalCount === 1 ? "" : "s"}
      </Text>
    </div>
  );
}
