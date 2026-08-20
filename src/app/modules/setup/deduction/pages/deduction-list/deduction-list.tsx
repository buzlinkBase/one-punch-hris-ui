import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useDeductions,
  useDeleteDeduction,
} from "../../hooks/use-deduction-queries";
import { useDeductionTypes } from "@/app/modules/setup/deduction-type/hooks/use-deduction-type-queries";
import DeductionTable from "../../components/deduction-table";
import { DEDUCTION_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function DeductionList() {
  const navigate = useNavigate();
  const {
    data: deductions = [],
    isLoading,
    isFetching,
    refetch,
  } = useDeductions();
  const { data: deductionTypes = [] } = useDeductionTypes();
  const { mutate: remove } = useDeleteDeduction();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {DEDUCTION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage deduction types applied to employee payroll computations.
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
              onClick={() => navigate({ to: "/setup/deduction/create" })}
            >
              Add Deduction
            </Button>
          </Space>
        </div>
      </div>
      <DeductionTable
        data={deductions}
        deductionTypes={deductionTypes}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
