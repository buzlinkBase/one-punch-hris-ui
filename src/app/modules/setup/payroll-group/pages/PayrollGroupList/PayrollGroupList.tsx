import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  usePayrollGroups,
  useDeletePayrollGroup,
} from "../../hooks/usePayrollGroupQueries";
import PayrollGroupTable from "../../components/PayrollGroupTable";
import { PAYROLL_GROUP_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function PayrollGroupList() {
  const navigate = useNavigate();
  const { data: payrollGroups = [], isLoading } = usePayrollGroups();
  const { mutate: remove } = useDeletePayrollGroup();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {PAYROLL_GROUP_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure payroll groupings for pay cycle and policy mapping.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/setup/payroll-group/create" })}
          >
            Add Payroll Group
          </Button>
        </div>
      </div>
      <PayrollGroupTable
        data={payrollGroups}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
