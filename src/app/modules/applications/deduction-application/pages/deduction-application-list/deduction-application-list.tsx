import { useMemo, useState } from "react";
import { Button, Select, Space, Typography, message } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useDeductionApplications,
  useDeleteDeductionApplication,
} from "../../hooks/use-deduction-application-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useDeductions } from "@/app/modules/setup/deduction/hooks/use-deduction-queries";
import DeductionApplicationTable from "../../components/deduction-application-table";
import { DEDUCTION_APPLICATION_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function DeductionApplicationList() {
  const navigate = useNavigate();
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();

  const {
    data: applications = [],
    isLoading,
    isFetching,
    refetch,
  } = useDeductionApplications();
  const { mutate: remove } = useDeleteDeductionApplication();
  const { data: rawEmployees = [] } = useEmployees();
  const { data: rawDeductions = [] } = useDeductions();

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

  const deductionMap = useMemo(
    () => Object.fromEntries(rawDeductions.map((d) => [d.id, d.name])),
    [rawDeductions],
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
              {DEDUCTION_APPLICATION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {DEDUCTION_APPLICATION_LABEL.SUBTITLE}
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
              onClick={() =>
                navigate({ to: "/applications/deduction-application/create" })
              }
            >
              New Loan / Deduction
            </Button>
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

      <DeductionApplicationTable
        data={filtered}
        loading={isLoading || isFetching}
        employeeMap={employeeMap}
        deductionMap={deductionMap}
        onEdit={(record) =>
          navigate({
            to: `/applications/deduction-application/${record.id}`,
          })
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
