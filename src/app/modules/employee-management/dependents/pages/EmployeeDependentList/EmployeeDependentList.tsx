import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useEmployeeDependents,
  useDeleteEmployeeDependent,
} from "../../hooks/useEmployeeDependentQueries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/useEmployeeQueries";
import EmployeeDependentTable from "../../components/EmployeeDependentTable";
import { EMPLOYEE_DEPENDENT_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function EmployeeDependentList() {
  const navigate = useNavigate();
  const { data: dependents = [], isLoading } = useEmployeeDependents();
  const { data: employees = [] } = useEmployees();
  const { mutate: remove } = useDeleteEmployeeDependent();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {EMPLOYEE_DEPENDENT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage employee dependents and beneficiary information.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate({ to: "/employee-management/dependents/create" })
            }
          >
            Add Dependent
          </Button>
        </div>
      </div>
      <EmployeeDependentTable
        data={dependents}
        employees={employees}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
