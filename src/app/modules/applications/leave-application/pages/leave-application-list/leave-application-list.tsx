import { useMemo, useState } from "react";
import { Button, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useLeaveApplications,
  useDeleteLeaveApplication,
  useChangeLeaveApplicationStatus,
} from "../../hooks/use-leave-application-queries";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import LeaveApplicationTable from "../../components/leave-application-table";
import { LEAVE_APPLICATION_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PageHeader } from "@/shared/components/page-header/page-header";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalTabs } from "@/shared/components/approval-tabs/approval-tabs";
import { useApprovalTabs } from "@/shared/hooks/use-approval-tabs";
import { useApplicationDrill } from "@/shared/drilldown/use-screen-drill";

export default function LeaveApplicationList() {
  const navigate = useNavigate();
  // A Dashboard or Analytics figure can open this list on a date range and tab.
  const drill = useApplicationDrill();
  const [dateRange, setDateRange] = useState<[string, string] | null>(
    drill.dateRange,
  );
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = useLeaveApplications(
    dateRange ? { from: dateRange[0], to: dateRange[1] } : undefined,
  );
  const { mutate: remove } = useDeleteLeaveApplication();
  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeLeaveApplicationStatus();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const { data: employees = [] } = useEmployeeFilter();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const filtered = useMemo(() => {
    if (!employeeFilter) return applications;
    return applications.filter((a) => a.employeeId === employeeFilter);
  }, [applications, employeeFilter]);
  const approval = useApprovalTabs(filtered, drill.tab);

  return (
    <div className="content-page">
      <PageHeader
        title={LEAVE_APPLICATION_LABEL.TITLE}
        subtitle="File and track employee leave requests."
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        actions={
          <PermissionGate permission="Leave:Create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/applications/leave/create" })}
            >
              New Leave
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <MobileRangePicker
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
        <Select
          allowClear
          showSearch
          placeholder="Filter by employee"
          options={employeeOptions}
          value={employeeFilter}
          onChange={setEmployeeFilter}
          className="w-60"
          filterOption={(input, opt) =>
            String(opt?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        />
      </div>

      <ApprovalTabs
        value={approval.tab}
        onChange={approval.setTab}
        pendingCount={approval.pendingCount}
        processedCount={approval.processedCount}
      />

      <LeaveApplicationTable
        data={approval.rows}
        employees={employees}
        leaveTypes={leaveTypes}
        loading={isLoading || isFetching}
        onDelete={remove}
        actionLoading={isChangingStatus}
        onApprove={(record, note) =>
          changeStatus({ record, status: "Approved", note })
        }
        onDecline={(record, note) =>
          changeStatus({ record, status: "Declined", note })
        }
      />
    </div>
  );
}
