import { useMemo, useState } from "react";
import { Button, Select, Space, Typography, message } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useOtherIncomeApplications,
  useDeleteOtherIncomeApplication,
} from "../../hooks/use-other-income-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useOtherIncomes } from "@/app/modules/setup/other-income/hooks/use-other-income-queries";
import OtherIncomeApplicationTable from "../../components/other-income-application-table";
import { OTHER_INCOME_APPLICATION_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function OtherIncomeApplicationList() {
  const navigate = useNavigate();
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = useOtherIncomeApplications();
  const { mutate: remove } = useDeleteOtherIncomeApplication();
  const { data: rawEmployees = [] } = useEmployees();
  const { data: rawIncomes = [] } = useOtherIncomes();

  const employeeMap = useMemo(
    () =>
      Object.fromEntries(
        rawEmployees.map((e) => [
          e.id,
          e.fullName ?? `${e.lastName}, ${e.firstName}`,
        ]),
      ),
    [rawEmployees],
  );

  const incomeMap = useMemo(
    () => Object.fromEntries(rawIncomes.map((i) => [i.id, i.name])),
    [rawIncomes],
  );

  const employeeOptions = rawEmployees.map((e) => ({
    value: e.id,
    label: e.fullName ?? `${e.firstName} ${e.lastName}`,
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
              {OTHER_INCOME_APPLICATION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {OTHER_INCOME_APPLICATION_LABEL.SUBTITLE}
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Other Income:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate({ to: "/applications/other-income/create" })
                }
              >
                New Application
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <Select
          allowClear
          showSearch
          placeholder="Filter by employee"
          options={employeeOptions}
          value={employeeFilter}
          onChange={setEmployeeFilter}
          style={{ width: 280 }}
          filterOption={(input, opt) =>
            String(opt?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        />
      </div>

      <OtherIncomeApplicationTable
        data={filtered}
        loading={isLoading || isFetching}
        employeeMap={employeeMap}
        incomeMap={incomeMap}
        onEdit={(record) =>
          navigate({ to: `/applications/other-income/${record.id}` })
        }
        onDelete={(id) =>
          remove(id, {
            onSuccess: () => message.success("Deleted."),
            onError: () => message.error("Failed to delete."),
          })
        }
      />
    </div>
  );
}
