import type { ReactNode } from "react";
import { Button, Input, Select, Typography } from "antd";
import {
  ClearOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { QuickRangeBar } from "@/shared/components/quick-range-bar/quick-range-bar";
import {
  BATCH_STATUS_FILTER_OPTIONS,
  type BatchStatusFilter,
} from "@/shared/utils/batch-status-filter.util";

const { Text } = Typography;

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
      <QuickRangeBar
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />

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
