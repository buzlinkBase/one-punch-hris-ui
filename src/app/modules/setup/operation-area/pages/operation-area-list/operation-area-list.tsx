import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useOperationAreas,
  useDeleteOperationArea,
} from "../../hooks/use-operation-area-queries";
import OperationAreaTable from "../../components/operation-area-table";
import { OPERATION_AREA_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function OperationAreaList() {
  const navigate = useNavigate();
  const {
    data: operationAreas = [],
    isLoading,
    refetch,
    isFetching,
  } = useOperationAreas();
  const { mutate: remove } = useDeleteOperationArea();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {OPERATION_AREA_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define and manage project sites used for employee and scheduling
              setup.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Organization Setup:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/setup/project-site/create" })}
              >
                Add Project Site
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <OperationAreaTable
        data={operationAreas}
        loading={isLoading}
        onDelete={remove}
      />
    </div>
  );
}
