import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  usePositions,
  useDeletePosition,
} from "../../hooks/use-position-queries";
import PositionTable from "../../components/position-table";
import { POSITION_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function PositionList() {
  const navigate = useNavigate();
  const { data: positions = [], isLoading } = usePositions();
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/setup/position/create" })}
          >
            Add Position
          </Button>
        </div>
      </div>
      <PositionTable data={positions} loading={isLoading} onDelete={remove} />
    </div>
  );
}
