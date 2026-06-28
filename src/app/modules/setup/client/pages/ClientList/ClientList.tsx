import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useClients, useDeleteClient } from "../../hooks/useClientQueries";
import ClientTable from "../../components/ClientTable";
import { CLIENT_LABEL } from "../../constants/label.const";

const { Title } = Typography;

export default function ClientList() {
  const navigate = useNavigate();
  const { data: clients = [], isLoading } = useClients();
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/setup/client/create" })}
          >
            Add Client
          </Button>
        </div>
      </div>
      <ClientTable data={clients} loading={isLoading} onDelete={remove} />
    </div>
  );
}
