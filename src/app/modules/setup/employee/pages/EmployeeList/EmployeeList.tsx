import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useEmployees,
  useDeleteEmployee,
} from "../../hooks/useEmployeeQueries";
import EmployeeTable from "../../components/EmployeeTable";
import { EMPLOYEE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function EmployeeList() {
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useEmployees();
  const { mutate: remove } = useDeleteEmployee();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="!mb-0">
              {EMPLOYEE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage and maintain employee records across your organization.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/setup/employee/create" })}
          >
            Add Employee
          </Button>
        </div>
      </div>

      <EmployeeTable data={employees} loading={isLoading} onDelete={remove} />
    </div>
  );
}
