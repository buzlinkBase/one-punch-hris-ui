import { Button, Space, Typography, message } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useOtherIncomeTypes,
  useDeleteOtherIncomeType,
} from "../../hooks/use-other-income-type-queries";
import OtherIncomeTypeTable from "../../components/other-income-type-table";
import { OTHER_INCOME_TYPE_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function OtherIncomeTypeList() {
  const navigate = useNavigate();
  const {
    data: items = [],
    isLoading,
    isFetching,
    refetch,
  } = useOtherIncomeTypes();
  const { mutate: remove } = useDeleteOtherIncomeType();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {OTHER_INCOME_TYPE_LABEL.LIST_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage categories for other income items.
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
                onClick={() =>
                  navigate({ to: "/setup/other-income-type/create" })
                }
              >
                Add Type
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <OtherIncomeTypeTable
        data={items}
        loading={isLoading || isFetching}
        onEdit={(r) => navigate({ to: `/setup/other-income-type/${r.id}` })}
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
