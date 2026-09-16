import { Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useClients, useDeleteClient } from "../../hooks/use-client-queries";
import ClientTable from "../../components/client-table";
import { CLIENT_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function ClientList() {
  const navigate = useNavigate();
  const { data: clients = [], isLoading, refetch, isFetching } = useClients();
  const { mutate: remove } = useDeleteClient();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {CLIENT_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Manage client accounts linked to employee assignments and billing.
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <PermissionGate permission="Workforce Setup:Create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: "/setup/client/create" })}
              >
                Add Client
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>
      <ClientTable data={clients} loading={isLoading} onDelete={remove} />
    </div>
  );
}
