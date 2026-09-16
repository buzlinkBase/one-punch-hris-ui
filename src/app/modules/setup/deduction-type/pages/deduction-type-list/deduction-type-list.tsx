import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useDeductionTypes,
  useDeleteDeductionType,
} from "../../hooks/use-deduction-type-queries";
import DeductionTypeTable from "../../components/deduction-type-table";
import { DEDUCTION_TYPE_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function DeductionTypeList() {
  const navigate = useNavigate();
  const { data: deductionTypes = [], isLoading } = useDeductionTypes();
  const { mutate: remove } = useDeleteDeductionType();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {DEDUCTION_TYPE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage deduction type categories used to classify payroll
              deductions.
            </p>
          </div>
          <PermissionGate permission="Deductions & Income Setup:Create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: "/setup/deduction-type/create" })}
            >
              Add Deduction Type
            </Button>
          </PermissionGate>
        </div>
      </div>
      <DeductionTypeTable
        data={deductionTypes}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
