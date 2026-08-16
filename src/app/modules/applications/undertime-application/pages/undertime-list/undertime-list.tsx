import { useMemo, useState } from "react";
import { Button, DatePicker, Select, Space, Typography } from "antd";
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

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function UndertimeList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();

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
              {UNDERTIME_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              File a request to excuse early time-out from biometric records.
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
              onClick={() => navigate({ to: "/applications/undertime/create" })}
            >
              File Undertime
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

      <UndertimeTable
        data={filtered}
        employees={employees}
        loading={isLoading || isFetching}
        onApprove={(record) => changeStatus({ record, status: "Approved" })}
        onDecline={(record) => changeStatus({ record, status: "Declined" })}
        onDelete={remove}
      />
    </div>
  );
}
