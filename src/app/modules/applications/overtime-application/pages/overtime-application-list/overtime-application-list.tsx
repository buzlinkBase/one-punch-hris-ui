import { useMemo, useState } from "react";
import { Button, Form, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useOvertimeApplications,
  useDeleteOvertimeApplication,
  useChangeOvertimeApplicationStatus,
} from "../../hooks/use-overtime-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import OvertimeApplicationTable from "../../components/overtime-application-table";
import { OVERTIME_APPLICATION_LABEL } from "../../constants/label.const";
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
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalTabs } from "@/shared/components/approval-tabs/approval-tabs";
import { useApplicationApprovalTabs } from "@/shared/hooks/use-application-approval-tabs";
import { useApplicationDrill } from "@/shared/drilldown/use-screen-drill";

const { Title } = Typography;

export default function OvertimeApplicationList() {
  const navigate = useNavigate();
  // A Dashboard or Analytics figure can open this list on a date range and tab.
  const drill = useApplicationDrill();
  const [dateRange, setDateRange] = useState<[string, string] | null>(
    drill.dateRange,
  );
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(true);

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = useOvertimeApplications(
    dateRange ? { from: dateRange[0], to: dateRange[1] } : undefined,
  );
  const { mutate: remove } = useDeleteOvertimeApplication();
  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeOvertimeApplicationStatus();
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
  const approval = useApplicationApprovalTabs(filtered, "Overtime", drill.tab);

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {OVERTIME_APPLICATION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File and track employee overtime requests.
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
            <PermissionGate permission="Overtime:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate({ to: "/applications/overtime/create" })
                }
              >
                File OT
              </Button>
            </PermissionGate>
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
        inProgressCount={approval.inProgressCount}
        processedCount={approval.processedCount}
        pendingLabel="For Approval"
      />

      <OvertimeApplicationTable
        data={approval.rows}
        employees={employees}
        loading={isLoading || isFetching}
        actionLoading={isChangingStatus}
        showApprovalProgress={approval.showProgress}
        onApprove={
          approval.canAct
            ? (record, note) =>
                changeStatus({ record, status: "Approved", note })
            : undefined
        }
        onDecline={
          approval.canAct
            ? (record, note) =>
                changeStatus({ record, status: "Declined", note })
            : undefined
        }
        onDelete={remove}
      />
    </div>
  );
}
