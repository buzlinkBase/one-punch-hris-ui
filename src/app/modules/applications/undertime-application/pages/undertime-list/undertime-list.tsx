import { useMemo, useState } from "react";
import { Button, Form, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useUndertimeApplications,
  useDeleteUndertimeApplication,
  useChangeUndertimeApplicationStatus,
} from "../../hooks/use-undertime-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import UndertimeTable from "../../components/undertime-table";
import { UNDERTIME_LABEL } from "../../constants/label.const";
import {
  FilterPanel,
  FilterToggleButton,
} from "@/shared/components/filter-panel/filter-panel";
import { FilterSelect } from "@/shared/components/filter-panel/filter-select";
import {
  compactChips,
  formatRangeChip,
  labelOf,
} from "@/shared/utils/filter-chips.util";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { ApprovalTabs } from "@/shared/components/approval-tabs/approval-tabs";
import { useApprovalTabs } from "@/shared/hooks/use-approval-tabs";

const { Title } = Typography;

export default function UndertimeList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(true);

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = useUndertimeApplications(
    dateRange ? { from: dateRange[0], to: dateRange[1] } : undefined,
  );
  const { mutate: remove } = useDeleteUndertimeApplication();
  const { mutate: changeStatus } = useChangeUndertimeApplicationStatus();
  const { data: rawEmployees = [] } = useEmployees();

  const employees = rawEmployees.map((e) => ({
    id: e.id,
    name: e.fullName ?? `${e.firstName} ${e.lastName}`,
  }));

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name,
  }));

  const activeFilterCount = [dateRange, employeeFilter].filter(Boolean).length;
  const filterChips = compactChips([
    formatRangeChip(dateRange?.[0], dateRange?.[1]),
    labelOf(employeeOptions, employeeFilter),
  ]);

  const filtered = useMemo(() => {
    if (!employeeFilter) return applications;
    return applications.filter((a) => a.employeeId === employeeFilter);
  }, [applications, employeeFilter]);
  const approval = useApprovalTabs(filtered);

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {UNDERTIME_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File a request to excuse early time-out from biometric records.
            </p>
          </div>
          <Space>
            <FilterToggleButton
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              activeCount={activeFilterCount}
            />
            <Button
              aria-label="Refresh"
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/applications/undertime/create" })}
            >
              New Undertime
            </Button>
          </Space>
        </div>
      </div>

      <FilterPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        chips={filterChips}
        onClear={() => {
          setDateRange(null);
          setEmployeeFilter(undefined);
        }}
        gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-x-4"
      >
        <Form.Item label="Date Range" className="mb-3 sm:col-span-2">
          <MobileRangePicker
            className="w-full"
            value={[
              dateRange ? dayjs(dateRange[0]) : null,
              dateRange ? dayjs(dateRange[1]) : null,
            ]}
            onChange={(dates) =>
              setDateRange(
                dates
                  ? [
                      dates[0]?.format("YYYY-MM-DD") ?? "",
                      dates[1]?.format("YYYY-MM-DD") ?? "",
                    ]
                  : null,
              )
            }
          />
        </Form.Item>
        <Form.Item label="Employee" className="mb-3">
          <FilterSelect
            placeholder="All employees"
            options={employeeOptions}
            value={employeeFilter}
            onChange={setEmployeeFilter}
          />
        </Form.Item>
      </FilterPanel>

      <ApprovalTabs
        value={approval.tab}
        onChange={approval.setTab}
        pendingCount={approval.pendingCount}
        processedCount={approval.processedCount}
      />

      <UndertimeTable
        data={approval.rows}
        employees={employees}
        loading={isLoading || isFetching}
        onApprove={(record) => changeStatus({ record, status: "Approved" })}
        onDecline={(record) => changeStatus({ record, status: "Declined" })}
        onDelete={remove}
      />
    </div>
  );
}
