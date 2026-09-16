import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useSssTableRows,
  useDeleteSssTableRow,
} from "../../hooks/use-sss-table-queries";
import SssTableTable from "../../components/sss-table-table";
import { SSS_TABLE_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function SssTableList() {
  const navigate = useNavigate();

  const { data: rows = [], isLoading, refetch, isFetching } = useSssTableRows();
  const { mutate: remove } = useDeleteSssTableRow();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {SSS_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage SSS contribution brackets.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Statutory Tables:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/setup/sss-table/create" })}
              >
                Add Bracket
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <SssTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
