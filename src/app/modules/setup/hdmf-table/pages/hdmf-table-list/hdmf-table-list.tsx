import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useHdmfTableRows,
  useDeleteHdmfTableRow,
} from "../../hooks/use-hdmf-table-queries";
import HdmfTableTable from "../../components/hdmf-table-table";
import { HDMF_TABLE_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function HdmfTableList() {
  const navigate = useNavigate();

  const {
    data: rows = [],
    isLoading,
    refetch,
    isFetching,
  } = useHdmfTableRows();
  const { mutate: remove } = useDeleteHdmfTableRow();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {HDMF_TABLE_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage Pag-IBIG contribution brackets.
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
                onClick={() => navigate({ to: "/setup/hdmf-table/create" })}
              >
                Add Bracket
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <HdmfTableTable data={rows} loading={isLoading} onDelete={remove} />
    </div>
  );
}
