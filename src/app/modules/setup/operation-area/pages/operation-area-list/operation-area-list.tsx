import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useOperationAreas,
  useDeleteOperationArea,
} from "../../hooks/use-operation-area-queries";
import OperationAreaTable from "../../components/operation-area-table";
import { OPERATION_AREA_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function OperationAreaList() {
  const navigate = useNavigate();
  const { data: operationAreas = [], isLoading } = useOperationAreas();
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
              Define work zones and coverage areas for operations planning.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/setup/operation-area/create" })}
          >
            Add Operation Area
          </Button>
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
