import { useMemo, useState } from "react";
import { Button, Select, Space, Tabs, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useOvertimeApplications,
  useDeleteOvertimeApplication,
} from "../../hooks/use-overtime-application-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import OvertimeApplicationTable from "../../components/overtime-application-table";
import { OVERTIME_APPLICATION_LABEL } from "../../constants/label.const";

const { Title } = Typography;

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "ForApproval", label: "For Approval" },
  { key: "Approved", label: "Approved" },
  { key: "Declined", label: "Declined" },
  { key: "Cancelled", label: "Cancelled" },
];

export default function OvertimeApplicationList() {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = useOvertimeApplications();
  const { mutate: remove } = useDeleteOvertimeApplication();
  const { data: employees = [] } = useEmployeeFilter();

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const filtered = useMemo(() => {
    let list = applications;
    if (statusTab !== "all")
      list = list.filter((a) => a.otStatus === statusTab);
    if (employeeFilter)
      list = list.filter((a) => a.employeeId === employeeFilter);
    return list;
  }, [applications, statusTab, employeeFilter]);

  const tabItems = STATUS_TABS.map((t) => ({
    key: t.key,
    label:
      t.key === "all"
        ? `All (${applications.length})`
        : `${t.label} (${applications.filter((a) => a.otStatus === t.key).length})`,
    children: (
      <OvertimeApplicationTable
        data={filtered}
        employees={employees}
        loading={isLoading || isFetching}
        onDelete={remove}
      />
    ),
  }));

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

      <div className="mb-3" style={{ maxWidth: 280 }}>
        <Select
          allowClear
          showSearch
          placeholder="Filter by employee"
          options={employeeOptions}
          value={employeeFilter}
          onChange={setEmployeeFilter}
          style={{ width: "100%" }}
          filterOption={(input, opt) =>
            String(opt?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        />
      </div>

      <Tabs
        activeKey={statusTab}
        onChange={setStatusTab}
        items={tabItems}
        size="small"
      />
    </div>
  );
}
