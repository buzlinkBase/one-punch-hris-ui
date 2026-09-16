import { Button, Space, Typography, message } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useOtherIncomes,
  useDeleteOtherIncome,
} from "../../hooks/use-other-income-queries";
import { useOtherIncomeTypes } from "@/app/modules/setup/other-income-type/hooks/use-other-income-type-queries";
import OtherIncomeTable from "../../components/other-income-table";
import { OTHER_INCOME_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function OtherIncomeList() {
  const navigate = useNavigate();
  const {
    data: items = [],
    isLoading,
    isFetching,
    refetch,
  } = useOtherIncomes();
  const { data: types = [] } = useOtherIncomeTypes();
  const { mutate: remove } = useDeleteOtherIncome();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {OTHER_INCOME_LABEL.LIST_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define allowances, bonuses, and other compensation items.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Deductions & Income Setup:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/setup/other-income/create" })}
              >
                Add Income
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <OtherIncomeTable
        data={items}
        types={types}
        loading={isLoading || isFetching}
        onEdit={(r) => navigate({ to: `/setup/other-income/${r.id}` })}
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
