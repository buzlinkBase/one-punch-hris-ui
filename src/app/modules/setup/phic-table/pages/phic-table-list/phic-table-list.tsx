import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  usePhicTableRows,
  useDeletePhicTableRow,
} from "../../hooks/use-phic-table-queries";
import PhicTableTable from "../../components/phic-table-table";
import { PHIC_TABLE_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function PhicTableList() {
  const navigate = useNavigate();

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = usePhicTableRows();
  const { mutate: remove } = useDeletePhicTableRow();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {PHIC_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage PhilHealth contribution brackets.
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
              onClick={() => navigate({ to: "/setup/phic-table/create" })}
            >
              Add Bracket
            </Button>
          </Space>
        </div>
      </div>

      <PhicTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
