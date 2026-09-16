import { useMemo, useState } from "react";
import { Button, Select, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
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
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function LeaveApplicationList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
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
  const { mutate: changeStatus } = useChangeLeaveApplicationStatus();
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

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {LEAVE_APPLICATION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File and track employee leave requests.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Leave:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/applications/leave/create" })}
              >
                File Leave
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

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
          style={{ width: 240 }}
          filterOption={(input, opt) =>
            String(opt?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        />
      </div>

      <LeaveApplicationTable
        data={filtered}
        employees={employees}
        leaveTypes={leaveTypes}
        loading={isLoading || isFetching}
        onDelete={remove}
        onApprove={(record) => changeStatus({ record, status: "Approved" })}
        onDecline={(record) => changeStatus({ record, status: "Declined" })}
      />
    </div>
  );
}
