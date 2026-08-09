import { useMemo, useState } from "react";
import { Button, DatePicker, Select, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useOvertimeApplications,
  useDeleteOvertimeApplication,
} from "../../hooks/use-overtime-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import OvertimeApplicationTable from "../../components/overtime-application-table";
import { OVERTIME_APPLICATION_LABEL } from "../../constants/label.const";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function OvertimeApplicationList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = useOvertimeApplications(
    dateRange ? { from: dateRange[0], to: dateRange[1] } : undefined,
  );
  const { mutate: remove } = useDeleteOvertimeApplication();
  const { data: rawEmployees = [] } = useEmployees();

  const employees = rawEmployees.map((e) => ({
    id: e.id,
    name: e.fullName ?? `${e.firstName} ${e.lastName}`,
  }));

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name,
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
              {OVERTIME_APPLICATION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File and track employee overtime requests.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/applications/overtime/create" })}
            >
              File OT
            </Button>
          </Space>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <RangePicker
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

      <OvertimeApplicationTable
        data={filtered}
        employees={employees}
        loading={isLoading || isFetching}
        onDelete={remove}
      />
    </div>
  );
}
