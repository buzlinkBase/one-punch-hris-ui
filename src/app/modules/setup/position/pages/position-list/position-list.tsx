import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  usePositions,
  useDeletePosition,
} from "../../hooks/use-position-queries";
import PositionTable from "../../components/position-table";
import { POSITION_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function PositionList() {
  const navigate = useNavigate();
  const {
    data: positions = [],
    isLoading,
    refetch,
    isFetching,
  } = usePositions();
  const { mutate: remove } = useDeletePosition();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {POSITION_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage job positions and their associated base rates.
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
                onClick={() => navigate({ to: "/setup/position/create" })}
              >
                Add Position
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <PositionTable data={positions} loading={isLoading} onDelete={remove} />
    </div>
  );
}
