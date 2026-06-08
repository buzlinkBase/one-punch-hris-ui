import { useState } from "react";
import { Badge, Button, Card, message, Typography } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import UnregisterEmployeeFilter from "../../components/UnregisterEmployeeFilter";
import UnregisterEmployeeTable from "../../components/UnregisterEmployeeTable";
import { UNREGISTER_EMPLOYEE_LABEL } from "../../constants/label.const";
import {
  useRegisterBiometricEmployee,
  useUnregisterBiometricEmployee,
  useUnregisterEmployees,
} from "../../hooks/useUnregisterEmployeeQueries";
import type { UnregisterEmployeeFilter as UnregisterEmployeeFilterRequest } from "../../models/api/request/unregister-employee-filter.model";

const { Title } = Typography;

export default function UnregisterEmployeeList() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<UnregisterEmployeeFilterRequest>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const activeFilterCount = [filters.fromDate].filter(Boolean).length;

  const { data: employees = [], isLoading } = useUnregisterEmployees(filters);
  const registerMutation = useRegisterBiometricEmployee();
  const unregisterMutation = useUnregisterBiometricEmployee();

  const handleFilter = (newFilters: UnregisterEmployeeFilterRequest) => {
    setFilters(newFilters);
  };

  const handleRegister = async (employeeId: string) => {
    try {
      setActionLoadingId(employeeId);
      await registerMutation.mutateAsync(employeeId);
      messageApi.success("Employee registered to biometric successfully.");
    } catch {
      messageApi.error("Failed to register employee.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnregister = async (employeeId: string) => {
    try {
      setActionLoadingId(employeeId);
      await unregisterMutation.mutateAsync(employeeId);
      messageApi.success("Employee unregistered from biometric successfully.");
    } catch {
      messageApi.error("Failed to unregister employee.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {UNREGISTER_EMPLOYEE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {UNREGISTER_EMPLOYEE_LABEL.SUBTITLE}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen((v) => !v)}
                type={filtersOpen ? "default" : "text"}
              >
                Filters
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtersOpen && (
          <Card size="small">
            <UnregisterEmployeeFilter
              onFilter={handleFilter}
              onReset={() => setFiltersOpen(false)}
              loading={isLoading}
            />
          </Card>
        )}
        <UnregisterEmployeeTable
          data={employees}
          loading={isLoading}
          actionLoadingId={actionLoadingId}
          onRegister={handleRegister}
          onUnregister={handleUnregister}
        />
      </div>
    </div>
  );
}
